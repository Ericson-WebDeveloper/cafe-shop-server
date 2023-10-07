

export const generateRandomString = (length: number) => {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'+'abcdefghijklmnopqrstuvwxyz0123456789@#$';
    for (let i = 1; i <= length; i++) {
        let char = Math.floor(Math.random()
                    * str.length + 1);
        pass += str.charAt(char)
    }
    return pass;
}

export const generateRandomStringWithoutCharacter = (length: number) => {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'+'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 1; i <= length; i++) {
        let char = Math.floor(Math.random()
                    * str.length + 1);
        pass += str.charAt(char)
    }
    return pass;
}