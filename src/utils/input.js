export function getPinchDistance(event) {
    const distance = {
        x: Math.abs(event.touches[0].clientX - event.touches[1].clientX),
        y: Math.abs(event.touches[0].clientY - event.touches[1].clientY)
    }

    return Math.sqrt(distance.x * distance.x + distance.y * distance.y)
}