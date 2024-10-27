import {useNavigate, useParams} from 'react-router-dom';
import {Button, Result} from "antd";
import {HttpErrorHandler} from "../../models/errors/HttpErrorHandler.tsx";

const ErrorComponent = () => {
    const navigate = useNavigate();
    const {status} = useParams();
    const error = HttpErrorHandler.getErrorByStatusCode(parseInt(status || "500"))

    return (
        <div>
            <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Result
                    title={error.message}
                    icon={HttpErrorHandler.getErrorIcon(parseInt(status || "500"))}
                    subTitle={error.description}
                    extra={[
                        <Button type="primary" key="Try again" onClick={async () => {
                            navigate(-1)
                        }}>
                            Try again
                        </Button>,
                    ]}
                />
            </div>
        </div>
    )
};

export default ErrorComponent;
