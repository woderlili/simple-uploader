<template>
  <div>
    <table class="expert_table">
      <tbody class="exam_tbody">
        <tr v-for="(file, index) in fileData" :key="index">
          <td
            class="taskBackMess"
            style="max-width: 50%"
            :title="file.filename"
          >
            <i class="el-icon-document"></i>
            {{ file.filename }}
          </td>
          <td style="width: 20%; padding-left: 8px" class="taskBackMess">
            <span
              style="display: inline-block; vertical-align: middle"
              v-if="file.totalSize && file.totalSize / 1024 <= 1024"
              >{{ (file.totalSize / 1024).toFixed(2) }}K</span
            >
            <span
              style="display: inline-block; vertical-align: middle"
              v-if="file.totalSize && file.totalSize / 1024 > 1024"
              >{{ (file.totalSize / 1024 / 1024).toFixed(2) }}M</span
            >
          </td>
          <td style="text-align: right; width: 120px">
            <el-button type="text" @click="viewFile(file)">预览</el-button>
            <el-button
              type="text"
              @click="deleteTag(file)"
              :disabled="isdisable"
              >删除</el-button
            >
            <!-- <el-button type="text" @click="globalConfig.handleFileDown(file)"
              >下载</el-button
            > -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { getHzm } from '@/utils/util';
export default {
  name: 'FileList',
  props: ['fileData', 'isdisable'],
  data() {
    return {
      checkAll: false,
      checkedAll: [],
      showFile: false,
      file: null
    };
  },
  methods: {
    viewFile(file) {
      const hzm = getHzm(file);
      if (hzm == '.rar' || hzm == '.zip' || hzm == '.RAR' || hzm == '.ZIP') {
        this.$message({
          type: 'warning',
          message: '压缩包不支持预览',
          duration: 1500
        });
        return false;
      } else {
        this.file = file;
        this.showFile = true;
      }
    },

    deleteTag(file) {
      this.$emit('deleteFile', file);
    },
    close() {
      this.showFile = false;
    }
  }
};
</script>
<style scoped>
.source::before {
  content: '\E61C';
  color: #c0c4cc;
}
.table span {
  margin: 0 5px;
}
.fdList {
  height: 205px;
  overflow: auto;
  margin-top: 8px;
}
.mt16 {
  margin-top: 16px;
}
.fdList .nameover {
  /* width: 100%; */
  width: 150px;
}

.expert_table {
  width: 100%;
  max-width: 100%;
  table-layout: fixed;
}

.expert_table tr {
  line-height: 54px !important;
  border-bottom: 1px #dee4f3 solid !important;
}

.taskBackMess {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #677083;
}
</style>
