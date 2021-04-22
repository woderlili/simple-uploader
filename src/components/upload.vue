<template>
  <div id="global-uploader" class="AD-uploadFile">
    <!-- 上传 -->
    <uploader
      ref="uploader"
      :options="options"
      :autoStart="false"
      :fileStatusText="fileStatusText"
      @files-added="onFilesAdd"
      @file-success="onFileSuccess"
      @file-error="onFileError"
      class="uploader-app"
    >
      <!-- @file-added="onFileAdded" -->
      <uploader-unsupport></uploader-unsupport>

      <uploader-btn :attrs="attrs" ref="uploadBtn">
        <i class="el-icon-plus fileAddIcon"></i>
      </uploader-btn>
      <span class="global-uploader-isDisable" v-show="isdisable">
        <span> <i class="el-icon-plus"></i></span>
      </span>
      <p class="infor_title">
        文件格式{{ fileType }}文件，且不超过{{ limit }}个，大小不超过{{ size }}M
      </p>
      <uploader-list v-show="panelShow">
        <div
          class="file-panel"
          slot-scope="props"
          :class="{ collapse: collapse }"
        >
          <div class="file-title">
            <h2 style="color: #606266; font-weight: 400">文件列表</h2>
            <div class="operate">
              <el-button
                class="mr8"
                @click="fileListShow"
                type="text"
                :title="collapse ? '展开' : '折叠'"
              >
                <i
                  style="font-weight: 700; font-size: 16px"
                  :class="collapse ? 'el-icon-full-screen' : 'el-icon-minus'"
                ></i>
              </el-button>
              <el-button @click="close" type="text" title="关闭">
                <i
                  style="font-weight: 700; font-size: 16px"
                  class="el-icon-close"
                ></i>
              </el-button>
            </div>
          </div>

          <ul :class="['file-list', 'file-lists_' + fileCompentId]">
            <li v-for="file in props.fileList" :key="file.id">
              <uploader-file
                :class="'file_' + file.id"
                ref="files"
                :file="file"
                :list="true"
              ></uploader-file>
            </li>
            <div class="no-file" v-if="!props.fileList.length">
              <i class="iconfont icon-empty-file"></i> 暂无待上传文件
            </div>
          </ul>
        </div>
      </uploader-list>
    </uploader>
  </div>
</template>

<script>
/**
 *   全局上传插件
 *   调用方法：Bus.$emit('openUploader', {}) 打开文件选择框，参数为需要传递的额外参数
 *   监听函数：Bus.$on('fileAdded', fn); 文件选择后的回调
 *            Bus.$on('fileSuccess', fn); 文件上传成功的回调
 */
import $ from 'jquery';
import SparkMD5 from 'spark-md5';
import { getHzm, toLower, fileType } from '@/utils/util';
export default {
  props: {
    //上传个数
    limit: {
      type: Number
    },
    // 上传类型
    fileType: {
      type: String
    },
    //上传大小
    size: {
      type: Number
    },
    //上传数组
    fileListArr: {
      type: Array
    },
    //是否禁用
    isdisable: {
      type: Boolean
    },
    // 组建唯一标示
    fileCompentId: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      options: {
        target: 'https://httpbin.org/post',
        chunkSize: 1024 * 1024 * 3, //1MB
        fileParameterName: 'upfile',
        simultaneousUploads: 1, //并发上传数，默认 3
        maxChunkRetries: 1,
        testChunks: true, //是否开启服务器分片校验
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: function (chunk, message) {
          const objMessage = JSON.parse(message);
          return (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0;
        },
        headers: {
          sessionid: 'SESSION_-1422202716'
        }
      },
      fileStatusText: {
        success: '上传成功',
        error: '上传失败',
        uploading: '上传中...',
        paused: '暂停',
        waiting: '排队中...'
      },
      attrs: {
        accept: fileType()
      },
      panelShow: false, //选择文件后，展示上传panel
      collapse: false,
      errorList: []
    };
  },
  computed: {
    //Uploader实例
    uploader() {
      return this.$refs.uploader.uploader;
    }
  },
  mounted() {
    this.attrs.accept = this.fileType.split(',');
  },
  methods: {
    onFilesAdd(fileList) {
      let flag = true;
      if (fileList && fileList.length > 0) {
        const fileArr =
          fileList.length > 0
            ? fileList
            : this.$refs.uploader.uploader.fileList.filter(
                (item) => !item.completed
              );
        for (let index = 0; index < fileArr.length; index++) {
          const element = fileArr[index];
          // 格式校验
          flag = this.beforeUpload(element, fileArr);
          if (!flag) {
            break;
          }
        }
      } else {
        flag = false;
      }
      if (!flag) {
        this.errorList = [];
        fileList.ignored = true; //不满足条件的就过滤掉
      }

      this.panelShow = true;
      fileList.forEach((element) => {
        // md5校验
        this.computeMD5(element);
      });
    },
    /*上传文件之前的钩子*/
    beforeUpload(file, fileList) {
      const ft = getHzm(file);
      const fileSize = file.size / 1024 / 1024;
      const limt = Number(fileSize.toFixed(2));
      // 上传的附件大小  大于  限制的上传大小 就不能上传
      const isLt5M = limt < Number(this.size.toFixed(2));
      let isLimit = false;
      let isHaveOne = false;
      let fileNum = 0;
      fileList.forEach((e) => {
        if (!e.completed) {
          fileNum++;
        }
      });

      if (this.fileListArr.length + fileNum > this.limit) {
        if (this.errorList.indexOf(1) === -1) {
          this.$message({
            type: 'warning',
            message: '最多上传' + this.limit + '个文件',
            duration: 1500
          });
          this.errorList.push(1);
        }
        return false;
      }
      if (this.fileType.indexOf(ft) === -1) {
        if (this.errorList.indexOf(1) === -1) {
          this.$message({
            type: 'warning',
            message: '暂不支持上传该文件类型',
            duration: 1500
          });
          this.errorList.push(1);
        }
        return false;
      }
      if (
        (file.type === 'image/jpeg' || file.type === 'image/png') &&
        file.name.length > 30
      ) {
        this.$message({
          type: 'warning',
          message: '图片名称不能超过30字!',
          duration: 1500
        });
        this.errorList.push(1);
        return false;
      }

      if (
        file.name.length > 80 &&
        (file.type !== 'image/jpeg' || file.type !== 'image/png')
      ) {
        this.$message({
          type: 'warning',
          message: '附件名称不能超过80字!',
          duration: 1500
        });
        this.errorList.push(1);
        return false;
      }
      if (!isLt5M) {
        if (this.errorList.indexOf(1) == -1) {
          this.$message({
            type: 'warning',
            message: '上传附件不超过' + this.size + 'MB',
            duration: 1500
          });
          this.errorList.push(1);
        }
        return false;
      }

      if (this.$refs.uploader.uploader.fileList.length > 1) {
        const arr = this.$refs.uploader.uploader.fileList;
        let num = 0;
        for (let index = 0; index < arr.length; index++) {
          const e = arr[index];
          if (!e.completed && e.name === file.name) {
            num++;
          }
          if (num > 1) {
            isLimit = true;
            if (this.errorList.indexOf(1) == -1) {
              this.$message({
                type: 'warning',
                message: '当前文件已在上传任务中',
                duration: 1500
              });
              this.errorList.push(1);
            }
          }
          if (isLimit) {
            break;
          }
        }
      }

      if (this.fileListArr.length > 0) {
        for (let index = 0; index < this.fileListArr.length; index++) {
          const item = this.fileListArr[index];
          if (toLower(item.filename) == toLower(file.name)) {
            isHaveOne = true;
          }
          if (isHaveOne) {
            break;
          }
        }
        if (isHaveOne) {
          if (this.errorList.indexOf(1) === -1) {
            this.$message({
              type: 'warning',
              message: '附件名称不能重复',
              duration: 1500
            });
            this.errorList.push(1);
          }
          return false;
        }
      }
      return isLt5M && !isLimit && !isHaveOne;
    },

    onFileProgress(rootFile, file, chunk) {
      console.log(
        `上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${
          chunk.endByte / 1024 / 1024
        }`
      );
    },
    onFileSuccess(rootFile, file, response, chunk) {
      let datas = null;
      if (typeof response === 'string') {
        datas = JSON.parse(response);
      }
      // 服务器自定义的错误（即虽返回200，但是是错误的情况），这种错误是Uploader无法拦截的
      // if (res.result && res.result !== true) {
      //   this.$message({ message: res.message, type: 'error' });
      //   // 文件状态设为“失败”
      //   this.statusSet(file.id, 'failed');
      //   return;
      // }
      // 如果服务端返回需要合并

      this.$emit('fileSuccess', datas);
      // console.log('上传成功');
    },
    onFileError(rootFile, file, response, chunk) {
      this.$message({
        message: response,
        type: 'error'
      });
    },

    /**
     * 计算md5，实现断点续传及秒传
     * @param file
     */
    computeMD5(file) {
      const fileReader = new FileReader();
      const time = new Date().getTime();
      const blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice;
      let currentChunk = 0;
      const chunkSize = 10 * 1024 * 1000;
      const chunks = Math.ceil(file.size / chunkSize);
      const spark = new SparkMD5.ArrayBuffer();

      // 文件状态设为"计算MD5"
      this.statusSet(file.id, 'md5');
      file.pause();

      loadNext();

      fileReader.onload = (e) => {
        spark.append(e.target.result);

        if (currentChunk < chunks) {
          currentChunk++;
          loadNext();

          // 实时展示MD5的计算进度
          this.$nextTick(() => {
            $(`.myStatus_${file.id}`).text(
              '校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%'
            );
          });
        } else {
          const md5 = spark.end();
          this.computeMD5Success(md5, file);

          this.$nextTick(() => {
            $(`.file_${file.id} .uploader-file-resume`).removeAttr('style', '');
          });
        }
      };

      fileReader.onerror = function () {
        this.error(`文件${file.name}读取出错，请检查该文件`);
        file.cancel();
      };

      function loadNext() {
        const start = currentChunk * chunkSize;
        const end =
          start + chunkSize >= file.size ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
    },

    computeMD5Success(md5, file) {
      // 将自定义参数直接加载uploader实例的opts上
      //  * @param fileMd5 总文件md5
      //  * @param chunk 第几个文件 0开始
      //  * @param chunks 总共分几片 默认1
      //  * @param name 文件名称
      //  * @param file  文件流名称 file
      const datas = {
        fileMd5: md5,
        name: file.name
      };
      Object.assign(this.uploader.opts, datas);

      file.uniqueIdentifier = md5;
      file.resume();
      this.statusRemove(file.id);
    },
    fileListShow() {
      const $list = $(`.file-lists_${this.fileCompentId}`);
      if ($list.is(':visible')) {
        $list.slideUp();
        this.collapse = true;
      } else {
        $list.slideDown();
        this.collapse = false;
      }
    },
    close() {
      this.$confirm('是否确定关闭窗口，关闭此窗口，文件将停止上传?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.uploader.cancel();
          this.panelShow = false;
        })
        .catch(() => {});
    },

    /**
     * 新增的自定义的状态: 'md5'、'transcoding'、'failed'
     * @param id
     * @param status
     */
    statusSet(id, status) {
      const statusMap = {
        md5: {
          text: '校验MD5',
          bgc: '#fff'
        },
        merging: {
          text: '合并中',
          bgc: '#e2eeff'
        },
        transcoding: {
          text: '转码中',
          bgc: '#e2eeff'
        },
        failed: {
          text: '上传失败',
          bgc: '#ffe0e0'
        },
        success: {
          text: '上传成功',
          bgc: '#fff'
        },
        uploading: {
          text: '上传中...',
          bgc: '#fff'
        },
        paused: {
          text: '暂停',
          bgc: '#fff'
        },
        waiting: {
          text: '排队中...',
          bgc: '#fff'
        }
      };

      this.$nextTick(() => {
        $(`<p class="myStatus_${id}"></p>`)
          .appendTo(`.file_${id} .uploader-file-status`)
          .css({
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '1',
            backgroundColor: statusMap[status].bgc
          })
          .text(statusMap[status].text);

        $(`.file_${id} .uploader-file-resume`).css('display', 'none');
      });
    },
    statusRemove(id) {
      this.$nextTick(() => {
        $(`.myStatus_${id}`).remove();
      });
    },

    error(msg) {
      this.$notify({
        title: '错误',
        message: msg,
        type: 'error',
        duration: 2000
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.infor_title {
  text-align: left;
  word-break: break-all;
  font-size: 14px;
  color: #999;
}
#global-uploader {
  // position: fixed;
  // z-index: 20;
  // right: 15px;
  // bottom: 15px;

  .global-uploader-isDisable {
    content: '';
    position: absolute;
    width: 140px;
    height: 60px;
    left: 0;
    top: 0;
    cursor: not-allowed;

    span {
      border-radius: 4px;
      width: 60px;
      height: 60px;
      position: absolute;
      left: 0;
      top: 0;
      background-color: #dedede !important;
      border-color: #e4e7ed !important;
      cursor: not-allowed !important;
      font-weight: 700;
      font-size: 20px;
      line-height: 60px !important;
      color: #999 !important;
      text-align: center;
    }
  }
  .uploader {
    display: flex;
    flex-direction: column;
  }

  .uploader-btn {
    width: 60px;
    height: 60px;
    line-height: 56px !important;
    font-size: 32px;
    border-radius: 4px;
    position: relative;
    background: #e3f1ff;
    font-weight: 700;
    text-align: center;
    line-height: 60px;
    border: 1px solid #e8e8e8;
    color: #97caff !important;
  }

  .fileAddIcon {
    font-weight: 700;
    font-size: 22px;
    line-height: 60px;
  }

  .uploader-btn::after {
    content: '(点击上传)';
    color: rgb(153, 153, 153);
    position: absolute;
    width: 90px;
    height: 60px;
    line-height: 60px;
    top: 0px;
    left: 70px;
    font-size: 14px;
    font-weight: 400;
  }

  .uploader-list {
    position: fixed;
    z-index: 20;
    bottom: 24px;
    right: 24px;
    width: 500px;
  }

  .file-panel {
    background-color: #fff;
    border: 1px solid #e2e2e2;
    border-radius: 7px 7px 0 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

    .file-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #ddd;
      h2 {
        font-size: 14px !important;
      }

      .operate {
        flex: 1;
        text-align: right;
      }
    }

    .file-list {
      position: relative;
      height: 240px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;

      > li {
        background-color: #fff;
      }
    }

    &.collapse {
      .file-title {
        background-color: #e7ecf2;
      }
    }
  }

  .no-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
  }

  /deep/.uploader-file-icon {
    &:before {
      content: '' !important;
    }

    &[icon='image'] {
      background: url(../assets/image-icon.png);
    }
    &[icon='video'] {
      background: url(../assets/video-icon.png);
    }
    &[icon='document'] {
      background: url(../assets/text-icon.png);
    }
  }

  /deep/.uploader-file-actions > span {
    margin-right: 6px;
  }
}
</style>
<style lang="scss">
.AD-uploadFile {
  .uploader-file-meta {
    width: 0px;
  }

  .uploader-file-status {
    text-indent: 0px;
  }
  .uploader-file-size {
    width: 85px !important;
  }
  .uploader-file-actions {
    width: 11%;
  }
}
</style>