
function _Directory(){
  var self = this
  $('.list').on('click', '.file', function(){
    $('.list .file').removeClass('selected')
    $(this).addClass('selected')
    self.setActions({
      name: $($(this).children("#name")).attr('data-file'),
      isdir: $($(this).children("#name")).attr('extension') === 'dir',
      isfile: $($(this).children("#name")).attr('extension') !== 'dir',
      lock: typeof $($(this).children("#name")).attr('lock') !== 'undefined'
    })
  })
}

_Directory.prototype.getDir = function(cb){
  var self = this
  $.post('/list-d', {
    dir: App.hash || '/'
  }, function (directory) {
    directory = JSON.parse(directory)
    if (directory.err) {
      $.notify.error({
        title: 'Error',
        text: directory.err
      })
    } else {
      self.append(directory)
    }
  })
}

_Directory.prototype.append = function(dir){
  console.log(dir)
  App.TopMenu.setFolderSize(App.Format.size(dir.totalSize))
  var previousDir = App.hash.split('/')
  if(previousDir[previousDir.length - 1] === ''){
    previousDir.pop()
  }
  previousDir.pop()
  previousDir = previousDir.join('/')
  App.List.addLine({
    name: '..',
    href: '#' + previousDir,
    type: 'file',
    extension: 'dir'
  })
  $.each(dir.files, function(index, value){
    value.name = index
    App.List.addLine({
      name: index,
      href: value.isfile ? null : '#' + App.hash + index + '/',
      type: 'file',
      extension: App.Format.extention(value),
      size: App.Format.size(value.size),
      date: App.Format.date(value.ctime),
      owner: value.owner || '-',
      lock: typeof value.downloading !== 'undefined',
      download: value.download
    })
  })
}

_Directory.prototype.setActions = function(file){
  App.TopMenu.setActions({
    download: file.isdir ? 'unactive' : '',
    rename: file.lock ? 'unactive' : '',
    remove: file.lock ? 'unactive' : '',
    info: file.isdir ? 'unactive' : ''
  })
}

App.Directory = new _Directory()
