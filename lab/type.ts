interface IdLabel {
    id: number /* some fields */;
  }
  interface NameLabel {
    name: string /* other fields */;
  }

type NameOrId<T extends number | string> = T extends number ? IdLabel : NameLabel;

function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
    if (typeof idOrName === "string") {
        return { name: idOrName } as NameOrId<T>;
    } else {
        return { id: idOrName } as NameOrId<T>;
    }
}
let a = createLabel("typescript");  // let a: NameLabel
let b = createLabel(2.8);           // let b: IdLabel
let c = createLabel(Math.random() ? "hello" : 42);  // let c: NameLabel | IdLabel
console.log(typeof a);
console.log(typeof b);
console.log(typeof c);
console.log(c);