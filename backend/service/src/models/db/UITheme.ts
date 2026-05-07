import mongoose, {Model, Document} from "mongoose";

const Schema = mongoose.Schema;
const DEFAULT_VALUES: any = {
    ID: "ID",
    buttonColor: "#1677ff",
    buttonTextColor: "#FFFFFF",
    registrationLogo: null,
    loginLogo: null,
    backgroundColor: "#FFFFFF",
    linkColor: "#1677ff",
    inputTextColor: "#000000",
    cardBackgroundColor: "#FFFFFF",
    cardBorderColor: "#f0f0f0"
};

export interface IUITheme extends Document {
    ID: string;
    buttonColor: string;
    buttonTextColor: string;
    registrationLogo: string;
    loginLogo: string;
    backgroundColor: string;
    linkColor: string;
    inputTextColor: string;
    cardBackgroundColor: string;
    cardBorderColor: string;
}

export interface IUIThemeModel extends Model<IUITheme> {
    load(): Promise<IUIThemeModel>;
    updateTheme(theme: IUITheme): Promise<IUITheme>;
    resetTheme(): Promise<IUITheme>;

}

const UIThemeSchema = new Schema<IUITheme, IUIThemeModel>({
    ID: {type: String, required: true, default: "ID", unique: true},
    buttonColor: {type: String, required: true},
    buttonTextColor: {type: String, required: true},
    registrationLogo: {type: String},
    loginLogo: {type: String},
    backgroundColor: {type: String, required: true},
    linkColor: {type: String, required: true},
    inputTextColor: {type: String, required: true},
    cardBackgroundColor: {type: String, required: true},
    cardBorderColor: {type: String, required: true}
}, {
    statics: {
        load: async function (): Promise<IUITheme> {
            let theme = await this.findOne({ID: "ID"});

            if (!theme) {
                theme = new UITheme({...DEFAULT_VALUES});
                await theme.save();
            }

            return theme;
        },
        updateTheme: async function (theme: IUITheme) {
            const updatedTheme = await this.findOneAndUpdate(
                {ID: "ID"},
                {...theme},
                {new: true}
            );
            return updatedTheme;
        },
        resetTheme: async function () {
            const updatedTheme = await this.findOneAndUpdate(
                {ID: "ID"},
                {...DEFAULT_VALUES},
                {new: true}
            );
            return updatedTheme;
        },
    }
});

const UITheme = mongoose.model<IUITheme, IUIThemeModel>('UITheme', UIThemeSchema);

export {
    UITheme
};
