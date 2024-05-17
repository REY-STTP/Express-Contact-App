document.querySelectorAll('.perspective-img').forEach(element => {
    element.style.transition = "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    element.style.cursor = "pointer";
});

function moveImage(event, element) {
    const boundingRect = element.getBoundingClientRect();
    const elementWidth = boundingRect.width;
    const elementHeight = boundingRect.height;

    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;

    const rotateY = (mouseX - elementWidth / 2) / (elementWidth / 2) * 20;
    const rotateX = -(mouseY - elementHeight / 2) / (elementHeight / 2) * 20;

    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function resetImage(element) {
    element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
}