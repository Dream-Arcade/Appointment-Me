import { Text, View } from "react-native";
import Day from "./Day";

function DaysScreen() {
  return (
    <View>
      <Day day={"Monday"} />
      <Day day={"Tuesday"} />
      <Day day={"Wednesday"} />
      <Day day={"Thursday"} />
      <Day day={"Friday"} />
      <Day day={"Saturday"} />
      <Day day={"Sunday"} />
    </View>
  );
}

export default DaysScreen;
