var doc = document.documentElement,
    resize = document.getElementById('resize'),
    img = document.querySelector('img'),
    lastWidth = null,
    down = null;

if (typeof window.FileReader === 'undefined') {
  alert('Needs FileReader - get yourself Opera or Chrome');
}

if (window.location.hash) {
  lastWidth = window.location.hash.substring(1);
} else {
  // read from local
  lastWidth = localStorage.lastWidth || null;
}
 
doc.ondragover = function () { this.className = 'hover'; return false; };
doc.ondragend = function () { this.className = ''; return false; };
doc.ondrop = function (e) {
  this.className = '';
  e.preventDefault();

  var file = e.dataTransfer.files[0],
      reader = new FileReader();
  reader.onload = function (event) {
    // remove existing images
    [].forEach.call(document.querySelectorAll('img'), function (img) {
      img.parentNode.removeChild(img);
    });

    img = new Image();
    img.onload = function () {
      document.body.appendChild(img);
      if (lastWidth !== null) {
        // var width = img.width;
        // img.width = lastWidth;
        // img.height = lastWidth / width * img.height;
        resizeImg(img.width);
      }
      positionResize();

    
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/new', true);
      xhr.onload = function(e) {
        var data = JSON.parse(this.responseText);
        window.history.replaceState({ width: img.width }, null, '/' + data.id + '/#' + img.width);
        document.title = 'FlickBin ' + img.width + 'x' + img.height;
      };

      var formData = new FormData();
      formData.append("image", file);

      xhr.send(formData);  // multipart/form-data
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);

  return false;
};

function positionResize() {
  if (img) {
    resize.style.left = (img.width - 10) + 'px';
    resize.style.top = (img.height - 10) + 'px';
  }
}

function resizeImg(width) {
  if (img) {
    var oldWidth = img.width;
    // console.log(width, img.width, img.height, width / oldWidth * img.height);
    var height = width / oldWidth * img.height | 0;    
    img.height = height;
    img.width = width;
    console.log(width, img.width, width == img.width, img.height, height, height == img.height);
  }
}

function sendSize(width) {
  var xhr = new XMLHttpRequest();
  var path = window.location.pathname.replace(/\/$/, '');
  xhr.open('POST', path + '/resize', true);
  var data = 'file=' + encodeURIComponent(img.src.replace(/.*\//, '')) + '&width=' + width;
  xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
  xhr.send(data);
}

doc.onmousedown = function (e) {
  if (img !== e.target) {
    e.preventDefault();
    down = img;
    doc.className = 'resizing';
  }
};

doc.onmouseup = function () {
  if (down) {
    if (lastWidth !== down.width) {
      window.history.pushState({ width: down.width }, null, '#' + down.width);
      document.title = 'FlickBin ' + img.width + 'x' + img.height;
      lastWidth = down.width;
      localStorage.lastWidth = lastWidth;
      sendSize(lastWidth);
    }
    down = false;
    doc.className = '';
  }
}

doc.onmousemove = function (e) {
  e.preventDefault();

  if (down) {
    var width = e.pageX;
    window.history.replaceState({ width: width }, null, '#' + width);
    resizeImg(width);
    positionResize();
  }
}

window.onpopstate = function (event) {
  if (img && event.state) {
    if (event.state.width) {
      console.log('resize')
      resizeImg(event.state.width);
      positionResize();
      lastWidth = event.state.width;
      localStorage.lastWidth = lastWidth;      
    } else {
      delete img.width;
      delete img.height;
      resize(img.width);
      delete location.lastWidth;
    }
  }
};

window.onload = function () {
  resizeImg(lastWidth);
  positionResize();
}




