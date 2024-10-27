import passwordValidator from "password-validator";
import generator from "generate-password";

const schema = new passwordValidator()
    .is().min(8, 'The min length of the password is 8')
    .is().max(40, 'The min length of the password is 40')
    .has().uppercase(1, 'The password has to contain at least one uppercase letter')
    .has().lowercase(1, 'The password has to contain at least one lowercase letter')
    .has().digits(1, 'The password has to contain at least one digit')
    .has().not().spaces();


const validatePassword = (password: string) => {
    return schema.validate(password, { list: true, details: true })
}

const generatePassword = () => {
    return generator.generate({
        length: 10,
        numbers: true,
        uppercase: true,
        lowercase: true,
        symbols: true
    });
}

export {
    validatePassword,
    generatePassword
}