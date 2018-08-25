/* Custom components */
$('[data-custom-component]').each(function() {
  const key = $(this).data('custom-component');
  const ev = $(this).data('custom-component-event') || 'click';

  $(this).one('settings:loaded', function() {
    console.log('Loaded settings');

    const d = require(__dirname + '\\assets\\js\\custom-components\\' + key + '.js');

    if (typeof d === 'object')
      for (const [event, f] of Object.entries(d))
        $(this).on(event, f);
    else $(this).on('ev', d);
  });
});