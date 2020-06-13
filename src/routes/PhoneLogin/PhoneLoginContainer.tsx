import React from "react";
import { Mutation } from "react-apollo";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { PHONE_SIGN_IN } from "./PhoneLogin.queries";
import PhoneLoginPresenter from "./PhoneLoginPresenter";

interface IState {
  countryCode: string;
  phoneNumber: string;
}

interface IMutation {
  phoneNumber: string;
}

class PhoneSignInMutation extends Mutation<any, IMutation> {}

class PhoneLoginContainer extends React.Component<
  RouteComponentProps<any>,
  IState
> {
  public state = {
    countryCode: "+82",
    phoneNumber: "",
  };

  public render() {
    const { countryCode, phoneNumber } = this.state;
    const internationalPhoneNumber = `${countryCode}-${phoneNumber}`;
    return (
      <PhoneSignInMutation
        mutation={PHONE_SIGN_IN}
        variables={{
          phoneNumber: internationalPhoneNumber,
        }}
      >
        {(mutation, { loading }) => {
          const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
            event.preventDefault();

            const isValid = /^\+[1-9]+-[0-9]{7,11}$/.test(
              internationalPhoneNumber
            );
            if (isValid) {
              mutation();
            } else {
              toast.error("please write a valid phone number!!!");
            }
          };
          return (
            <PhoneLoginPresenter
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              onInputChange={this.onInputChange}
              onSubmit={onSubmit}
              loading={loading}
            />
          );
        }}
      </PhoneSignInMutation>
    );
  }

  public onInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement
  > = (event) => {
    const {
      target: { name, value },
    } = event;
    this.setState({
      [name]: value,
    } as any);
  };
}

export default PhoneLoginContainer;