let first = [1, 2];
let second = [3, 4];
let bothPlus = [0, ...first, ...second, 5];

console.log(bothPlus); // [0, 1, 2, 3, 4, 5]

bothPlus[1] = 100;
console.log(bothPlus); // [0, 100, 2, 3, 4, 5]
console.log(first); // [1, 2]
