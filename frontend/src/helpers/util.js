const addLog = (line, logName) => {
  if (line && logName) {
    const item = document.createElement('p');
    item.innerText = line.data[logName].data;
    item.className = 'log-row';
    const parent = document.getElementById(`log-entry-${logName}`);
    parent.append(item);
    // update counter
    const logCounter = document.getElementById(`log-counter-${logName}`);
    logCounter.innerText = Number(logCounter.innerText) + 1;
    const scrollOffset = Math.abs(parent.scrollHeight - parent.scrollTop);
    // scroll only if the position of the scroll is near/to the end of the scroll height
    if (scrollOffset < 270) {
      parent.scrollTop = parent.scrollHeight;
    }
  }
};

export { addLog };
