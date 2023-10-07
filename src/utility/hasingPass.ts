import bcrypt from 'bcrypt'

export const hashPass = async (password: string) => {
    // generate salt to hash password
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
}

export const comparePass = async(password: string, userpassword: string) => {
    return await bcrypt.compare(password, userpassword);
}