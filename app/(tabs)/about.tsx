import { colors } from "@/utils/colors";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AboutScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgColor }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.reportBox}>
          <Text style={styles.reportTitle}>Report Wildlife Crimes</Text>
          <Text style={styles.reportDescription}>
            This app is designed for reporting criminal activities against
            wildlife and nature, including:
          </Text>
          <Text style={styles.reportText}>🦏 Poaching of animals</Text>
          <Text style={styles.reportText}>
            🌳 Illegal deforestation and tree cutting
          </Text>
          <Text style={styles.reportText}>
            💧 Water pollution and habitat destruction
          </Text>
          <Text style={styles.reportText}>
            🔥 Forest fires caused by human negligence
          </Text>
          <Text style={styles.reportText}>
            🚜 Encroachment of protected forest areas
          </Text>

          <Text style={styles.reportText}>
            Help us protect nature by reporting any suspicious activities. Your
            information will be kept confidential.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.title}>Ministry of Forest and Environment</Text>
          <Text style={styles.description}>
            गण्डकी प्रदेशभित्र रहेका प्राकृतिक स्रोतहरुको संरक्षण, सम्वर्द्धन, विकास, विस्तार र सदुपयोग गर्दै उक्त स्रोतहरु मार्फत् प्रदेशको समृद्धि र विकास गर्ने उद्देश्यले गण्डकी प्रदेश सरकारको प्रतिनिधित्व गर्दै प्रदेश सरकार स्थापना भई मिति २०७४/१०/२२ मा उद्योग, पर्यटन, वन तथा वातावरण मन्त्रालय स्थापना भयो । नेपालको संविधानको अनुसूची  ६, ७ र ९ मा व्यवस्था भए वमोजिम प्रदेशको एकल र साझा अधिकार सूचीमा पर्ने उद्योग, पर्यटन, आपूर्ति, वाणिज्य, विज्ञान प्रविधि, वन तथा वातावरणसँग सम्बन्धित विषय वमोजिम मन्त्रालयले कार्य गरिरहेको थियो । नेपाल सरकार र स्थानीय तह बीच समन्वय र सहकार्य गर्दै प्रदेश समृद्धिका लागि औद्योगिकरणमा जोड दिने, पर्यटन क्षेत्रको विकास र विस्तार गरी नयाँ नयाँ रोजगारीको अवसर सृजना गर्ने, वनको दिगो व्यवस्थापन तथा तालतलैया र एकीकृत जलाधार व्यवस्थापन गरी वातावरण संरक्षणमा जोड दिनु, दैनिक उपभोग्य वस्तु तथा सेवाको सहज र सुलभ आपूर्ति व्यवस्थापन लगायतका कार्यहरु गर्दै आएको थियो ।
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.title}>About FON Nepal</Text>
          <Text style={styles.description}>
            Friends of Nature (FON) Nepal is a youth-led NGO dedicated to
            environmental conservation and biodiversity protection. Since 2005,
            FON Nepal has been conducting research, advocacy, and
            community-based projects to safeguard Nepal’s ecosystems, from the
            lowlands to the highlands.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.title}>About NIC Nepal</Text>
          <Text style={styles.description}>
            Established in 2012, the National Innovation Center a nonprofit sharing organization is dedicated to creating the culture of research and innovation in Nepal.
Inside Tribhuvan University, Kirtipur, Kathmandu, Nepal - 44618
          </Text>
        </View>

        <View style={styles.reportBox}>
          <Text style={styles.reportTitle}>
            User Privacy Notes and Anonymization statement
          </Text>
          <Text style={styles.reportDescription}>
            सुराकी एप्लिकेशनले प्रयोगकर्ताको अनुमतिमा मात्र सामान्य जानकारी
            संकलन गर्नेछ जसमा प्रयोगकर्ताको नाम, इमेल र सुराकी गरेको स्थान आदि
            पर्दछ | स्वीकृतिबिना प्रयोगकर्ताको कुनै पनि जानकारी, कुनै पनि
            निकायलाई दिइनेछैन | सुराकी गर्नेको जानकारी पूर्णरुपमा गोप्य हुनेछ |
          </Text>
          <Text style={styles.reportText}>
            SURAKI application shall collect minimal personal information (in
            case permitted by user) to enhance user experience. This may include
            username, email, and location. We do not share this information
            without the user’s consent. The system will receive anonymous data.
          </Text>
        </View>

        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>सम्पर्क सहायताका (Contact)</Text>
          <Text style={styles.contactText}>📧 Email: moitfe4@gmail.com</Text>
          <Text style={styles.contactText}>📞 Phone: 061-458058/590304/457669/457668</Text>
          <Text style={styles.contactText}>🌐 Website: mofesc.gandaki.gov.np/</Text>
        </View>

        <TouchableOpacity
          onPress={() => Linking.openURL("https://mofesc.gandaki.gov.np/")}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>थप जानकारी (Learn More)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: colors.bgColor, // Dark background color
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    // textAlign: 'center',
    // marginTop: 20,
    marginBottom: 10,
    color: colors.white, // White text color
  },
  description: {
    fontSize: 16,
    textAlign: "justify",
    color: colors.white, // White text color
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: colors.primary2, // Slightly lighter background for info box
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  infoText: {
    fontSize: 14,
    color: colors.white, // White text color
    marginBottom: 5,
  },
  linkButton: {
    backgroundColor: colors.yellowColor,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  linkText: {
    fontSize: 16,
    color: colors.white, // White text color for links
  },
  contactBox: {
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    backgroundColor: colors.primary2, // Dark background for contact box
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.white, // White text color for title
  },
  contactText: {
    fontSize: 14,
    color: colors.white, // White text color for contact details
    marginBottom: 8,
  },
  reportBox: {
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    backgroundColor: colors.primary2,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.white,
    // textAlign: "center"
  },
  reportDescription: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 10,
    textAlign: "justify",
  },
  reportText: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 5,
    textAlign: "justify",
  },
});

export default AboutScreen;
