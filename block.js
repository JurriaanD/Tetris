class Block {
  constructor(shape, col) {
    this.shape = shape;
    this.col = col;
    this.pos = createVector(0, 0);
  }

  print() {
    console.table(this.shape);
  }

  rotate() {
    let newShape = [];
    for (let i = 0; i < this.shape[0].length; i++) {
      let newRow = [];
      for (let j = this.shape.length-1; j >= 0; j--) {
        newRow.push(this.shape[j][i]);
      }
      newShape.push(newRow);
    }
    this.shape = newShape;
  }

  copy() {
    let b = new Block(this.shape, this.col);
    b.pos = this.pos;
    return b;
  }
}
