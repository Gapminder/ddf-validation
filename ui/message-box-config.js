module.exports = (parent) => {
  return {
    parent,
    label: '{yellow-fg} Diagnostics {/yellow-fg}',
    content: '',
    mouse: true,
    keys: true,
    vi: true,
    border: {
      type: 'line',
      fg: '#eeeeee'
    },
    scrollable: true,
    scrollbar: {
      fg: 'white',
      ch: '|'
    },
    width: '100%',
    height: '40%',
    top: '0',
    left: '0',
    align: 'left',
    tags: true
  };
};
