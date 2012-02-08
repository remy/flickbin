var doc = document.documentElement,
    resize = document.getElementById('resize'),
    img = null,
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
        var width = img.width;
        img.width = lastWidth;
        img.height = lastWidth / width * img.height;
      }
      positionResize();

      /**
       * TODO
       * - send image to server via XHR
       * - return ID and set on url
       * - 
       */

    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);

  return false;
};

function positionResize() {
  resize.style.left = (img.width - 10) + 'px';
  resize.style.top = (img.height - 10) + 'px';
}

function resizeImg(width) {
  var oldWidth = img.width;
  img.width = width;
  img.height = width / oldWidth * img.height;
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
      lastWidth = down.width;
      localStorage.lastWidth = lastWidth;
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
  if (img) {
    if (event.state.width) {
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







