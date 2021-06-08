import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import QuizIndex from "./screens/QuizIndex";
import Quiz from "./screens/Quiz";
import Recognize from "./screens/Recognize";
import Connection from "./screens/connection/index";

const MainStack = createStackNavigator({
  Connection: {
    screen: Connection,
    navigationOptions: {
      headerTitle: "GloveLibras",
      header: null
    }
  },
  Quiz: {
    screen: Quiz,
    navigationOptions: ({ navigation }) => ({
      headerTitle: navigation.getParam("title"),
      headerTintColor: "#fff",
      headerStyle: {
        backgroundColor: navigation.getParam("color"),
        borderBottomColor: navigation.getParam("color")
      }
    })
  },
  QuizIndex: {
    screen: QuizIndex,
    navigationOptions: ({ navigation }) => ({
      headerTitle: 'Luva conectada',
      headerTintColor: "#fff",
      headerStyle: {
        backgroundColor: 'rgb(25, 68, 104)',
        borderBottomColor: navigation.getParam("color")
      }
    })
  },
  Recognize: {
    screen: Recognize,
    navigationOptions: ({ navigation }) => ({
      headerTitle: navigation.getParam("title"),
      headerTintColor: "#fff",
      headerStyle: {
        backgroundColor: navigation.getParam("color"),
        borderBottomColor: navigation.getParam("color")
      }
    })
  },
});

export default createAppContainer(MainStack);
