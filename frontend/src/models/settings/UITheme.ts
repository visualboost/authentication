export class UITheme {
    ID: string;
    buttonColor: string;
    buttonTextColor: string;
    registrationLogo: string | null;
    loginLogo: string | null;
    backgroundColor: string;
    linkColor: string;
    inputTextColor: string;
    cardBackgroundColor: string;
    cardBorderColor: string;

    constructor(
        ID: string,
        buttonColor: string,
        buttonTextColor: string,
        registrationLogo: string | null,
        loginLogo: string | null,
        backgroundColor: string,
        linkColor: string,
        inputTextColor: string,
        cardBackgroundColor: string,
        cardBorderColor: string
    ) {
        this.ID = ID;
        this.buttonColor = buttonColor;
        this.buttonTextColor = buttonTextColor;
        this.registrationLogo = registrationLogo;
        this.loginLogo = loginLogo;
        this.backgroundColor = backgroundColor;
        this.linkColor = linkColor;
        this.inputTextColor = inputTextColor;
        this.cardBackgroundColor = cardBackgroundColor;
        this.cardBorderColor = cardBorderColor;
    }

    static fromJson(json: UITheme): UITheme {
        return new UITheme(
            json.ID,
            json.buttonColor,
            json.buttonTextColor,
            json.registrationLogo,
            json.loginLogo,
            json.backgroundColor,
            json.linkColor,
            json.inputTextColor,
            json.cardBackgroundColor,
            json.cardBorderColor
        );
    }
}
