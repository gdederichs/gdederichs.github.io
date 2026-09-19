(() => {
  const loadFragment = (placeholderId, fragmentPath) => {
    fetch(fragmentPath)
      .then((response) => response.text())
      .then((markup) => {
        document.getElementById(placeholderId).innerHTML = markup;
      });
  };

  loadFragment('navbar-placeholder', 'navbar.html');
  loadFragment('footer-placeholder', 'footer.html');
})();
