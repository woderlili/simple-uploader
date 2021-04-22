<template>
  <div>
    <div class="lay">
      <span class="lay-left"> 附件： </span>
      <div class="lay-right">
        <upload-files
          ref="upload"
          :limit="10"
          :fileType="fileType"
          :fileListArr="fileArr"
          :size="50"
          @fileSuccess="fileSuccess"
        ></upload-files>
        <file-list
          :fileData="fileArr"
          @deleteFile="handleFileRemove"
        ></file-list>
      </div>
    </div>
  </div>
</template>

<script>
import uploadFiles from '@/components/upload.vue';
import fileList from '@/components/fileList.vue';
export default {
  components: { uploadFiles, fileList },
  data() {
    return {
      fileArr: [],
      fileType:
        '.jpg,.png,.jpeg,.mp4,.mp3.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.zip,.rar'
    };
  },
  methods: {
    handleFileRemove(file) {
      console.log('complete', file);
    },
    fileSuccess(file) {
      this.fileArr.push(file.form);
      console.log('file complete', file);
    }
  }
};
</script>

<style lang="scss" >
.lay {
  width: 600px;
  display: flex;
  margin: 0 auto;
}

.lay-left {
  width: 150px;
  text-align: right;
  padding-right: 8px;
  box-sizing: border-box;
}

.lay-right {
  width: 500px;
  display: flex;
  flex-direction: column;
}
</style>