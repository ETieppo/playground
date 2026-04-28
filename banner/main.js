function drawIcons() {
  let insertInto = "";
  ["rust", "ts", "nest", "react", "tailwind"].map((icon, i) => {
    insertInto += `<img class="${icon === 'ts' ? 'ts-icon' : 'icon-item'}" src="imgs/${icon}.png"></img>`
  })

  const iconContainer = document.getElementById("icons-container");
  iconContainer.innerHTML = insertInto;
}

drawIcons();
