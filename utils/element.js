const removeElement = (page, selector) =>
  page.evaluate((selector) => {
    const remove = (el) => {
      if (el) el.remove();
    };

    remove(document.querySelector(selector));
  }, selector);

module.exports = { removeElement };
