import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useState } from "react";

export default function ModalScreen() {
  // Separate state for each input
  const [titleSearch, setTitleSearch] = useState("");
  const [isbnSearch, setISBNSearch] = useState("");
  const [condition, setCondition] = useState("Any");
  const [paymentType, setPaymentType] = useState("Any");

  // Modal state
  const [isConditionModalVisible, setConditionModalVisible] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);

  // Condition options
  const conditionOptions = ["Any", "New", "Used", "Noted"];

  // Payment Type options
  const paymentTypeOptions = ["Any", "Venmo", "Zelle"];

  // Render picker modal
  const renderPickerModal = (
    options: string[],
    isVisible: boolean,
    setModalVisible: (visible: boolean) => void,
    currentValue: string,
    setValue: (value: string) => void
  ) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Option</Text>
          <FlatList
            data={options}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  item === currentValue && styles.selectedOption,
                ]}
                onPress={() => {
                  setValue(item);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { textDecorationLine: "underline" }]}>
          Books
        </Text>
        <Text style={styles.headerTitle}>Items</Text>
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.identifierContainer}>
          <Text style={styles.titleName}>Title</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Name of the Book"
            value={titleSearch}
            onChangeText={setTitleSearch}
          />
        </View>
        <View style={styles.identifierContainer}>
          <Text style={styles.titleName}>ISBN</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="#"
            value={isbnSearch}
            onChangeText={setISBNSearch}
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={13}
          />
        </View>
        <View style={styles.identifierContainer}>
          <Text style={styles.titleName}>Condition</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setConditionModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>{condition}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.identifierContainer}>
          <Text style={styles.titleName}>Payment Type</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setPaymentModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>{paymentType}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchButtonContainer}>
          <View style={styles.searchButton}>
            <TouchableOpacity>
              <Text
                style={[
                  styles.titleName,
                  { color: "#FFFFFF", fontWeight: "800" },
                ]}
              >
                Apply Search!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Condition Modal */}
      {renderPickerModal(
        conditionOptions,
        isConditionModalVisible,
        setConditionModalVisible,
        condition,
        setCondition
      )}

      {/* Payment Type Modal */}
      {renderPickerModal(
        paymentTypeOptions,
        isPaymentModalVisible,
        setPaymentModalVisible,
        paymentType,
        setPaymentType
      )}

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "flex-start",
  },
  headerContainer: {
    height: "10%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "25%",
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "900",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 5,
  },
  mainContainer: {
    height: "80%",
    flexDirection: "column",
  },
  identifierContainer: {
    height: "15%",
    flexDirection: "column",
    marginHorizontal: 30,
    justifyContent: "center",
  },
  titleName: {
    fontSize: 20,
    fontWeight: "600",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 5,
  },
  searchInput: {
    height: 35,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  dropdownButton: {
    height: 35,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  searchButtonContainer: {
    height: "15%",
    flexDirection: "column",
    marginHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButton: {
    height: "50%",
    width: "70%",
    borderRadius: 8,
    backgroundColor: "#38B6FF",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#f0f0f0",
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  cancelButtonText: {
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
  },
});
