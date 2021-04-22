
// 文件的预览
export function getHzm(file) {
  return file.name ? '.' + file.name.split('.')[file.name.split('.').length - 1].toLowerCase() : '.' + file.attaname.split('.')[file.attaname
    .split('.').length - 1].toLowerCase();
}

export function toLower(str) {
  let ind = str.lastIndexOf('.'); //取到文件名开始到最后一个点的长度
  let len = str.length; //取到文件名长度
  let hzm = str.substring(ind + 1, len); //截
  let name = str.substring(0, ind).trim(); //去掉后缀名的文件名
  return (name + '.' + hzm.toLowerCase()); //返回后缀名转小写完整的文件名
}


export function fileType() {
  const image = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];
  const video = ['.mp4', '.rmvb', '.mkv', '.wmv', '.flv'];
  const document = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt', '.tif', '.tiff'];
  return [...image, ...video, ...document];
};