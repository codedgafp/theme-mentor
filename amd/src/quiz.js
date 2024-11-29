$(document).ready(function () {
    //Remove PDF icon on quiz activity
    var pdfIconLink = Array.from(document.querySelectorAll('a')).find(function(link) {
    return link.href.includes('target=pdf');  
  });
  
 
  if (pdfIconLink && pdfIconLink.parentNode) {
    pdfIconLink.parentNode.removeChild(pdfIconLink);
  }
});