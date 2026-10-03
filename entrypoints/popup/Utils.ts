const getActiveTab = async () => {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0]?.id;
}

export default getActiveTab;
