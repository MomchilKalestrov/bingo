const cloneObject = <T>(obj: T): T =>
    JSON.parse(JSON.stringify(obj));

export default cloneObject;