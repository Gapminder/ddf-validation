module.exports = (parent) => {
  return {
    parent,
    label: '{red-fg} Result {/red-fg}',
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
    height: '59%',
    top: '40%',
    left: '0',
    align: 'left',
    tags: true
  };
};
