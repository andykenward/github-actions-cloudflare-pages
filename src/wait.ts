export async function wait(milliseconds: number): Promise<string> {
  return new Promise(resolve => {
    if (Number.isNaN(milliseconds)) {
      throw new TypeError('milliseconds not a number')
    }

    setTimeout(() => resolve('done!'), milliseconds)
  })
}
