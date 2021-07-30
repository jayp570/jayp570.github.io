function findMinArray(array) {
    let min = array[0]
    for(let i = 0; i < array.length; i++) {
        if(array[i] < min) {
            min = array[i]
        }
    }
    return min
}

function findMaxArray(array) {
    let max = array[0]
    for(let i = 0; i < array.length; i++) {
        if(array[i] > max) {
            max = array[i]
        }
    }
    return max
}

function findMinObjectValue(object) {
    let min = object[Object.keys(object)[0]]
    for(let key of Object.keys(object)) {
        if(object[key] < min) {
            min = object[key]
        }
    }
    return min
}

function findMaxObjectValue(object) {
    let max = object[Object.keys(object)[0]]
    for(let key of Object.keys(object)) {
        if(object[key] > max) {
            max = object[key]
        }
    }
    return max
}

function listToString(array) {
    let string = "["
    for(let i = 0; i < array.length; i++) {
        string += item + (i == array.length ? "" : ", ")
    }
    string += "]"
    return string
}

function ceilTo(num1, num2) {
    return Math.ceil(num1/num2)*num2
}

function sortArray(array) {
    let list = JSON.parse(JSON.stringify(array))
    for(let i = 0; i < list.length-1; i++) {
        for(let j = 0; j < list.length-i-1; j++) {
            if(list[j+1] < list[j]) {
                let temp1 = list[j+1]
                let temp2 = list[j]
                list[j+1] = temp2
                list[j] = temp1
            }
        }
    }
    return list
}