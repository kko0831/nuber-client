import { SubscribeToMoreOptions } from "apollo-client";
import React from "react";
import { Mutation, MutationFn, Query } from "react-apollo";
import { RouteComponentProps } from "react-router-dom";
import { USER_PROFILE } from "../../sharedQueries.queries";
import {
  getChat,
  getChatVariables,
  sendMessage,
  sendMessageVariables,
  userProfile,
} from "../../types/api";
import { GET_CHAT, SEND_MESSAGE, SUBSCRIBE_TO_MESSAGES } from "./Chat.queries";
import ChatPresenter from "./ChatPresenter";

interface IProps extends RouteComponentProps<any> {}

interface IState {
  message: "";
}

class ProfileQuery extends Query<userProfile> {}

class ChatQuery extends Query<getChat, getChatVariables> {}

class SendMessageMutation extends Mutation<sendMessage, sendMessageVariables> {}

class ChatContainer extends React.Component<IProps, IState> {
  public sendMessageMutation:
    | MutationFn<sendMessage, sendMessageVariables>
    | undefined;

  public unsubscribeToGetChat: any | null = null;
  public subscribeToGetChat: any | null = null;

  constructor(props: IProps) {
    super(props);
    if (!props.match.params.chatId) {
      props.history.push("/");
    }
    this.state = {
      message: "",
    };
  }

  public componentDidMount() {
    if (this.subscribeToGetChat) {
      const subscribeToMoreOptions: SubscribeToMoreOptions = {
        document: SUBSCRIBE_TO_MESSAGES,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev;
          }

          const updatedData = Object.assign({}, prev, {
            GetChat: {
              ...prev.GetChat,
              chat: {
                ...prev.GetChat.chat,
                messages: [
                  ...prev.GetChat.chat.messages,
                  subscriptionData.data.MessageSubscription,
                ],
              },
            },
          });
          return updatedData;
        },
      };
      this.unsubscribeToGetChat = this.subscribeToGetChat!(
        subscribeToMoreOptions
      );
    }
  }

  public componentWillUnmount() {
    if (this.unsubscribeToGetChat) {
      // tslint:disable-next-line: no-console
      console.log("componentWillUnmount");
      this.unsubscribeToGetChat();
    }
  }

  public render() {
    const {
      match: {
        params: { chatId },
      },
    } = this.props;
    const { message } = this.state;
    return (
      <ProfileQuery query={USER_PROFILE}>
        {({ data: userData }) => (
          <ChatQuery
            query={GET_CHAT}
            variables={{ chatId: parseInt(chatId, 10) }}
          >
            {({ data: chatData, loading, subscribeToMore }) => {
              this.subscribeToGetChat = subscribeToMore;

              return (
                <SendMessageMutation mutation={SEND_MESSAGE}>
                  {(sendMessageMutation) => {
                    this.sendMessageMutation = sendMessageMutation;
                    return (
                      <ChatPresenter
                        userData={userData}
                        loading={loading}
                        chatData={chatData}
                        messageText={message}
                        onInputChange={this.onInputChange}
                        onSubmit={this.onSubmit}
                      />
                    );
                  }}
                </SendMessageMutation>
              );
            }}
          </ChatQuery>
        )}
      </ProfileQuery>
    );
  }

  public onInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const {
      target: { name, value },
    } = event;
    this.setState({
      [name]: value,
    } as any);
  };

  public onSubmit = () => {
    const { message } = this.state;
    const {
      match: {
        params: { chatId },
      },
    } = this.props;
    if (message !== "") {
      this.setState({
        message: "",
      });
      // tslint:disable-next-line: no-unused-expression
      this.sendMessageMutation &&
        this.sendMessageMutation({
          variables: {
            chatId: parseInt(chatId, 10),
            text: message,
          },
        });
    }
    return;
  };
}

export default ChatContainer;
