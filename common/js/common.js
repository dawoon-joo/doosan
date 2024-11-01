
document.addEventListener("DOMContentLoaded", function() {
  loadContent('header', '/inc/header.html');
  // loadContent('footer', '/inc/footer.html');
});


function loadContent(elementId, url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      document.getElementById(elementId).innerHTML = xhr.responseText;
    }
  };
  xhr.send();
}
