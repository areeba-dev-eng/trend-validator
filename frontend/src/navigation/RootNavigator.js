// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import AuthNavigator from './AuthNavigator';
// import TabNavigator from './TabNavigator';
// import SearchScreen from '../screens/SearchScreen';
// import ResultsScreen from '../screens/ResultsScreen';
// import AccountProfileScreen from '../screens/AccountProfileScreen';
// import SubscriptionScreen from '../screens/SubscriptionScreen';
// import HelpSupportScreen from '../screens/HelpSupportScreen';
// import { colors } from '../theme';

// const Stack = createNativeStackNavigator();

// export default function RootNavigator() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: false,
//         contentStyle: { backgroundColor: colors.bg },
//         animation: 'slide_from_right',
//       }}
//     >
//       <Stack.Screen name="Auth" component={AuthNavigator} />
//       <Stack.Screen name="Tabs" component={TabNavigator} />

//       <Stack.Screen
//         name="Search"
//         component={SearchScreen}
//         options={{
//           animation: 'slide_from_bottom',
//           presentation: 'modal',
//         }}
//       />

//       <Stack.Screen name="Results" component={ResultsScreen} />
//       <Stack.Screen
//         name="AccountProfile"
//         component={AccountProfileScreen}
//       />

//       <Stack.Screen
//         name="Subscription"
//         component={SubscriptionScreen}
//       />

//       <Stack.Screen
//         name="HelpSupport"
//         component={HelpSupportScreen}
//       />
//     </Stack.Navigator>
//   );
// }

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import SearchScreen from '../screens/SearchScreen';
import ResultsScreen from '../screens/ResultsScreen';
import AccountProfileScreen from '../screens/AccountProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import GenerateIdeaScreen from '../screens/GenerateIdeaScreen';
import MarketInsightsScreen from '../screens/MarketInsightsScreen';
import NicheFinderScreen from '../screens/NicheFinderScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Tabs" component={TabNavigator} />

      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />

      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="AccountProfile" component={AccountProfileScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

      <Stack.Screen name="GenerateIdea" component={GenerateIdeaScreen} />
      <Stack.Screen name="MarketInsights" component={MarketInsightsScreen} />
      <Stack.Screen name="NicheFinder" component={NicheFinderScreen} />
    </Stack.Navigator>
  );
}
