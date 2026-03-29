export function formatMessage({ buildType, appName, version, contentItems }) {
  const filteredItems = contentItems.filter((item) => item.content.trim());

  if (buildType === 'test') {
    let msg = '';
    msg += `👉 App name: ${appName}\n`;
    msg += `👉 Version: ${version}\n`;
    msg += `👉 Nội dung:\n`;
    filteredItems.forEach((item) => {
      msg += `- ${item.content}\n`;
    });
    return msg.trimEnd();
  }

  if (buildType === 'online') {
    let msg = '';
    msg += `🆙🆙🆙 Build Online ${appName} 🆙🆙🆙\n\n`;
    msg += `🆚 Version: ${version}\n\n`;
    msg += `ℹ️ Nội dung:\n`;
    filteredItems.forEach((item) => {
      msg += `- ${item.content}\n`;
    });
    return msg.trimEnd();
  }

  return '';
}
