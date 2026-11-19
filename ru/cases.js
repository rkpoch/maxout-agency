// The poster is a direct video link when JavaScript is unavailable.
document.querySelectorAll('.case-video').forEach(function (link) {
  link.addEventListener('click', function (event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    var player = document.createElement('iframe');
    player.className = 'case-player';
    player.title = link.getAttribute('aria-label');
    player.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    player.allowFullscreen = true;
    var source = new URL(link.href);
    source.pathname = '/embed' + source.pathname;
    source.searchParams.set('autoplay', '1');
    player.src = source.href;
    link.replaceWith(player);
    player.focus();
  });
});
