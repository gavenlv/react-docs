# 29 - React Native 移动端开发

## 🎯 本节目标
- 理解 React Native 的核心原理和架构
- 掌握移动端特有的开发模式（导航、手势、传感器等）
- 构建跨平台的高质量移动应用

---

## 📖 React Native 概述

### 核心优势

| 特性 | 原生开发 | Flutter | React Native |
|------|---------|--------|-------------|
| **学习成本** | 高 (Swift/Kotlin/Java) | 中 (Dart) | **低** (JavaScript/TypeScript + React) |
| **代码复用** | 无 (iOS/Android分开写) | ~90% | **~85-90%** |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ (接近原生) |
| **热重载** | ❌ | ✅ | ✅ **Fast Refresh** |
| **社区生态** | 平台官方 | Google | **庞大 (React生态)** |
| **招聘难度** | 需分别招iOS/Android | 相对新 | **前端工程师可快速上手** |

### 适用场景
- ✅ 社交应用、电商App
- ✅ 内容展示型应用
- ✅ 需要快速迭代的产品
- ✅ 团队已有Web前端经验
- ⚠️ 对性能要求极致的(游戏、AR/VR)建议用原生

---

## 🏗️ 项目初始化与配置

### 1. 创建项目

```bash
# 使用官方CLI (推荐)
npx react-native@latest init MyApp --pm npm
# 或使用 TypeScript 模板
npx react-native@latest init MyApp --template react-native-template-typescript

# 进入目录
cd MyApp

# 运行 (需要先启动模拟器或连接真机)
# iOS:
npm run ios
# Android:
npm run android

# 或使用 Expo (更简单,无需配置原生环境)
npx create-expo-app MyExpoApp
cd MyExpoApp
npx expo start
```

### 2. 目录结构规范

```
MyApp/
├── __tests__/                 # 测试文件
├── android/                   # Android原生代码
│   ├── app/
│   └── build.gradle
├── ios/                       # iOS原生代码
│   ├── MyApp/
│   └── Podfile
├── src/
│   ├── components/            # 通用UI组件
│   │   ├── ui/                # 基础组件(Button/Input等)
│   │   ├── layout/            # 容器组件(Card/List/Modal等)
│   │   └── index.ts
│   ├── screens/               # 页面组件
│   │   ├── HomeScreen/
│   │   ├── ProfileScreen/
│   │   └── index.ts
│   ├── navigation/            # 路由导航配置
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── features/              # 业务模块(按功能域)
│   │   ├── auth/
│   │   │   ├── api.ts         # API请求
│   │   │   ├── hooks.ts       # 自定义Hooks
│   │   │   ├── store.ts       # 状态(Zustand/Pinia)
│   │   │   └── types.ts       # 类型定义
│   │   ├── post/
│   │   └── chat/
│   ├── hooks/                 # 全局自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useNetworkStatus.ts
│   │   └── useBiometric.ts
│   ├── services/              # 服务层
│   │   ├── api-client.ts      # Axios封装
│   │   ├── storage.ts         # AsyncStorage封装
│   │   └── analytics.ts       # 统计埋点
│   ├── utils/                 # 工具函数
│   │   ├── date.ts
│   │   ├── validators.ts
│   │   └── platform.ts        # Platform检测
│   ├── constants/             # 常量定义
│   │   ├── theme.ts           # 主题色/字体等
│   │   ├── routes.ts          # 路由名称常量
│   │   └── endpoints.ts       # API地址
│   ├── assets/                # 静态资源
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   ├── types/                 # 全局类型
│   │   └── index.d.ts
│   └── App.tsx                # 入口组件
├── app.json                   # 应用配置(Expo)
├── package.json
├── tsconfig.json
└── babel.config.js
```

### 3. 基础组件对比 (Web vs RN)

```jsx
// Web中的概念 → React Native对应
// div → View (容器,不可滚动)
// span → Text (文本必须包在Text内)
// img → Image / ImageBackground
// input → TextInput
// button → TouchableOpacity / Pressable
// ul/li → FlatList / SectionList / ScrollView
// a → 可点击的Text或TouchableOpacity
// svg → react-native-svg (需安装)
// css → StyleSheet.create({}) (类似但有限制)

// ✅ 基础示例
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
} from 'react-native';

function HelloWorld() {
  return (
    <SafeAreaView style={styles.container}>
      {/* 状态栏 */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Hello React Native!</Text>
        <Text style={styles.subtitle}>跨平台移动开发</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  // 类似flex:1占满父元素
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',  // 主轴居中(类似justify-content)
    alignItems: 'center',     // 交叉轴居中(类似align-items)
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default HelloWorld;
```

---

## 🧭 导航系统 (React Navigation v6+)

### 安装与配置

```bash
# 安装核心库及依赖
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/material-top-tabs react-native-screens react-native-safe-area-context

# iOS需要额外安装pods
cd ios && pod install && cd ..

# (可选)安装动画库
npm install react-native-reanimated react-native-gesture-handler @react-navigation/drawer
```

### Stack Navigation (堆栈导航 - 类似浏览器历史记录)

```tsx
// navigation/MainNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from ../screens/DetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  Detail: { itemId: string; title: string };  // 定义参数类型
  Profile: { userId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,  // iOS返回按钮文字
        gestureEnabled: true,  // 允许滑动手势返回(iOS)
        animation: 'slide_from_right',  // 页面转场动画
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: '首页' }}
      />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={({ route }) => ({ 
          title: route.params?.title || '详情',
          headerRight: () => <ShareButton />,  // 自定义右侧按钮
        })}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          headerShown: false,  // 隐藏默认header,页面自己画
          presentation: 'modal',  // 模态弹出效果
        }}
      />
    </Stack.Navigator>
  );
}

// 在页面中使用导航
function HomeScreen({ navigation }: { navigation: any }) {
  // 注意:实际应使用useNavigation Hook获取typed的navigation
  const handlePress = (item: Item) => {
    // 跳转并传参(完全类型安全!)
    navigation.navigate('Detail', { 
      itemId: item.id, 
      title: item.name,
    });
  };

  // 替换当前栈(不希望用户返回)
  const handleLoginSuccess = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  // 返回上一级
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 列表内容... */}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// 在目标页面接收参数
function DetailScreen({ route }: { route: any }) {
  // 从route.params中解构参数
  const { itemId, title } = route.params;

  useEffect(() => {
    // 可以根据itemId加载数据...
  }, [itemId]);

  return (
    <View style={{ flex: 1 }}>
      <Text>Item ID: {itemId}</Text>
      <Text>Title: {title}</Text>
    </View>
  );
}
```

### Bottom Tabs Navigation (底部标签栏)

```tsx
// navigation/TabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';  // 或react-native-vector-icons/Ionicons;

type TabParamList = {
  MainTabs_Home: undefined;
  MainTabs_Discover: undefined;
  MainTabs_Profile: undefined;
  // 命名空间避免冲突
};

const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'MainTabs_Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MainTabs_Discover') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'MainTabs_Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // @ts-ignore
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveColor: '#9ca3af',
        tabBarShowLabel: true,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 4,
          height: 60,
          borderTopColor: '#e5e7eb',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="MainTabs_Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: '首页' }}
      />
      <Tab.Screen 
        name="MainTabs_Discover" 
        component={DiscoverScreen}
        options={{ tabBarLabel: '发现' }}
      />
      <Tab.Screen 
        name="MainTabs_Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: '我的' }}
      />
    </Tab.Navigator>
  );
}
```

### Drawer Navigation (侧边抽屉)

```tsx
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'front',  // front/back/slide
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStyle: {
          width: 300,
          backgroundColor: '#fff',
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

// 自定义抽屉内容
function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props}>
      {/* 用户信息头部 */}
      <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#eee' }}>
        <Avatar source={{ uri: user.avatar }} size={80} />
        <Text style={{ marginTop: 10 }}>{user.name}</Text>
        <Text style={{ color: '#666' }}>{user.email}</Text>
      </View>

      {/* 导航菜单 */}
      <DrawerItemList {...props} />

      {/* 自定义菜单项 */}
      <DrawerItem
        label="帮助中心"
        icon={() => <Icon name="help-circle" />}
        onPress={() => props.navigation.navigate('Help')}
      />

      <DrawerItem
        label="退出登录"
        icon={() => <Icon name="log-out" />}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}
```

### Deep Link & Universal Link (外部打开App特定页面)

```typescript
// App.tsx (链接处理)
import { NavigationContainer, linking } from './navigation/linking-config';
import MainNavigator from './navigation/MainNavigator';

// 配置映射关系
const config = {
  prefixes: ['myapp://', 'https://app.mydomain.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Detail: 'post/:postId',  // myapp://post/123 → Detail页
          Profile: 'user/:userId',
        },
      },
      Settings: 'settings',
    },
  },
};

function App() {
  return (
    <NavigationContainer linking={config}>
      <MainNavigator />
    </NavigationContainer>
  );
}

// 处理传入的URL (在某个地方监听)
import { Linking } from 'react-native';

useEffect(() => {
  // App被Link唤醒时触发
  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    // 解析url并手动导航(如果linking没覆盖到)
  };

  // 监听App从后台恢复
  const subscription = Linking.addEventListener('url', handleDeepLink);

  // 检查App是否是被Link启动的(冷启动)
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => subscription.remove();
}, []);
```

---

## 🎨 移动端UI组件库推荐

### 1. NativeBase / React Native Elements / Tamagui

```bash
# NativeBase (高度定制的组件库)
npm install native-base @react-native-async-storage/async-storage @react-native-masked-view/masked-view react-native-svg react-native-animated-linear-gradient

# 或 React Native Elements (Material Design风格)
npm install react-native-elements @react-native-vector-icons/ionicons

# 或Tamagui (性能优化,类似styled-components)
npx tamagui@latest init
```

```tsx
// 使用NativeBase示例
import { 
  Box, 
  Text, 
  Button, 
  Input, 
  FormControl, 
  Heading, 
  VStack, 
  HStack,
  useTheme,
} from 'native-base';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      await auth.login(email, password);
    } catch (error) {
      showToast(error.message);
    }
  };

  return (
    <Box safeArea p={4} flex={1} bg="white">
      <VStack space={4} mt={8}>
        <Heading size="lg" color="coolGray.600">
          欢迎回来
        </Heading>

        <FormControl isRequired>
          <FormControl.Label>邮箱</FormControl.Label>
          <Input 
            placeholder="请输入邮箱" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>密码</FormControl.Label>
          <Input 
            type="password"
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </FormControl>

        <Button onPress={handleSubmit} mt={2}>
          登录
        </Button>

        <HStack space={2} justifyContent="center">
          <Text color="coolGray.600">还没有账号?</Text>
          <Text 
            color="blue.500" 
            bold
            onPress={() => navigation.push('Register')}
          >
            注册
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
```

### 2. 自定义常用组件

```tsx
// components/ui/Button.tsx
interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled,
  style,
  ...props 
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);

  const getVariantStyles = (): StyleProp<ViewStyle> => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed ? '#2563eb' : '#3b82f6',
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: '#3b82f6',
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): StyleProp<ViewStyle> => {
    const sizes = {
      sm: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32 },
      md: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44 },  // Apple HIG推荐的触摸区域最小44px
      lg: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 52 },
    };
    return sizes[size];
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      style={[
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#3b82f6'} size="small" />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          
          <Text 
            style={[
              styles.text,
              variant === 'primary' && { color: '#fff' },
              variant !== 'primary' && { color: '#3b82f6' },
            ]}
          >
            {children}
          </Text>

          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}

// components/ui/Input.tsx
export function Input({ label, error, helperText, ...props }: TextInputProps & { label?: string; error?: string; helperText?: string; }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isFocused && styles.labelFocused]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        <TextInput
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9ca3af"
          style={styles.input}
          {...props}
        />
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helper, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}
```

---

## 📱 移动端特有API与权限

### 1. 权限管理 (Android/iOS)

```bash
# 权限管理库
npm install react-native-permissions
# 或 Expo: npx expo install expo-device expo-image-picker
```

```tsx
// hooks/usePermissions.ts
import { request, check, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { Platform } from 'react-native';

type PermissionType = 
  | 'camera'
  | 'photo-library'  // iOS相册
  | 'storage'        // Android存储
  | 'location'
  | 'notification'
  | 'microphone'
  | 'contacts';

async function requestPermission(permission: PermissionType): Promise<'granted' | 'denied' | 'blocked'> {
  let permissionType;

  switch (permission) {
    case 'camera':
      permissionType = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      break;
    case 'location':
      permissionType = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      break;
    // 其他权限...
  }

  // 先检查当前状态
  const result = await check(permissionType);

  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    
    case RESULTS.DENIED:
      // 弹出系统授权弹窗
      const requestResult = await request(permissionType);
      return requestResult === RESULTS.GRANTED ? 'granted' : 'denied';
    
    case RESULTS.BLOCKED:
    case RESULTS.LIMITED:
      // 用户之前拒绝且选择了"不再询问",引导去设置页开启
      Alert.alert(
        '权限请求',
        `请在设置中允许${getPermissionName(permission)}权限`,
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: openSettings },
        ]
      );
      return 'blocked';
      
    case RESULTS.UNAVAILABLE:
      console.warn('此设备不支持该权限');
      return 'denied';
  }
}

function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const status = await requestPermission('camera');
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <LoadingSpinner />;
  }

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>无相机访问权限</Text>
        <Button title="重新申请" onPress={() => requestPermission('camera')} />
      </View>
    );
  }

  // 有权限了,渲染相机界面...
  return <CameraView />;
}
```

### 2. 生物识别认证 (Face ID / TouchID)

```bash
npm install react-native-biometrics
# 或 Expo: npx expo install local-authentication
```

```tsx
import ReactNativeBiometrics from 'react-native-biometrics';

function BiometricAuth() {
  const authenticate = async () => {
    try {
      const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert('提示', '您的设备不支持生物识别');
        return;
      }

      // 提示用户正在验证身份
      const { success, signature } = await ReactNativeBiometrics.createSignature({
        promptMessage: '请验证身份以登录',
        payload: 'login-auth-payload',  // 用于签名的数据
      });

      if (success) {
        // 验证成功,signature发送到后端校验
        await verifySignatureOnServer(signature);
      }
    } catch (error) {
      if (error.code === 'USER_CANCELED') {
        console.log('用户取消了验证');
      } else {
        Alert.alert('错误', '验证失败,请重试');
      }
    }
  };

  return (
    <Button title="Face ID / Touch ID 登录" onPress={authenticate} />
  );
}
```

### 3. 推送通知 (FCM / APNs)

```bash
# Firebase Cloud Messaging (Android & iOS通用)
npm install @react-native-firebase/app @react-native-firebase/messaging
# 或 Expo: npx expo install expo-notifications
```

```typescript
// services/notification-service.ts
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class NotificationService {
  private onNotificationCallback: ((message: any) => void) | null = null;

  async initialize() {
    // 1. 请求权限(iOS必须, Android13开始也需要)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('用户拒绝了推送权限');
      return null;
    }

    // 2. 获取设备Token(用于服务端向该设备发消息)
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    
    // 将token上传到你的服务器
    await uploadDeviceToken(token);

    // 3. 监听Token刷新(Token可能变化!)
    messaging().onTokenRefresh(async newToken => {
      await updateDeviceToken(newToken);  // 更新服务器记录
    });

    // 4. 前台消息处理(决定前台收到通知时的行为)
    this.onForegroundMessage();
    
    // 5. 后台/终止状态消息处理(点击通知后打开App)
    this.onBackgroundMessage();

    return token;
  }

  // 订阅特定Topic (群发消息)
  async subscribeToTopic(topic: string) {
    await messaging().subscribeToTopic(topic);
  }

  // 取消订阅
  async unsubscribeFromTopic(topic: string) {
    await messaging().unsubscribeFromTopic(topic);
  }

  // 设置回调
  onNotification(callback: (message: RemoteMessage) => void) {
    this.onNotificationCallback = callback;
  }

  private onForegroundMessage() {
    // App在前台时收到消息
    messaging().onMessage(async remoteMessage => {
      console.log('前台收到新消息:', remoteMessage);

      // 显示本地通知(因为前台不会自动显示横幅)
      // 可使用 notifee / react-native-push-notification 等库
      displayLocalNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
      });

      // 回调给业务层
      this.onNotificationCallback?.(remoteMessage);
    });
  }

  private onBackgroundMessage() {
    // 用户点击通知启动App时触发
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('App因通知被打开:', remoteMessage.data);
        
        // 根据data跳转到指定页面
        handleNotificationOpen(remoteMessage.data);
      }
    });
  }
}

export default new NotificationService();
```

### 4. 网络状态检测

```tsx
// hooks/useNetworkStatus.ts
import { useNetInfo } from '@react-native-community/netinfo';
import { useCallback, useRef } from 'react';

function useNetworkStatus() {
  const netInfo = useNetInfo({
    reachabilityUrl: 'https://clients3.google.com/generate_204',  // 检测可达性
    reachabilityTest: async (response) => response.status === 204,
    reachabilityShortTimeout: 10 * 1000, // ms
    reachabilityLongTimeout: 60 * 1000,
  });

  const previousIsOnlineRef = useRef(netInfo.isConnected);

  const isOnline = netInfo.isConnected && !netInfo.isInternetReachable === false;
  
  // 检测网络状态变化(用于自动同步离线队列等)
  const networkChangeHandlerRef = useRef<() => void>();
  
  const onReconnect = useCallback((handler: () => void) => {
    networkChangeHandlerRef.current = handler;
  }, []);

  // 监听网络恢复
  useEffect(() => {
    if (!previousIsOnlineRef.current && isOnline) {
      // 从断网变为联网
      networkChangeHandlerRef.current?.();
    }
    previousIsOnlineRef.current = isOnline;
  }, [isOnline]);

  return {
    isConnected: isOnline,
    type: netInfo.type,  // wifi/cellular/unknown
    isWifiReachable: netInfo.type === 'wifi',
    onReconnect,
  };
}

// 在App中使用
function App() {
  const { isConnected, onReconnect } = useNetworkStatus();

  useEffect(() => {
    onReconnect(() => {
      syncOfflineQueue();  // 恢复联网后执行
      refetchData();       // 重新拉取最新数据
    });
  }, [onReconnect]);

  if (!isConnected) {
    return <OfflineBanner />;  // 显示离线提示条
  }

  return <MainContent />;
}
```

---

## 🔥 性能优化最佳实践

### 1. 列表渲染优化

```tsx
// ❌ 错误:直接在renderItem内部创建函数和对象
<FlatList
  data={items}
  renderItem={({ item }) => (
    <TouchableOpacity 
      onPress={() => navigate(item.id)}  // 每次都新建函数!
      style={{ marginBottom: 10 }}       // 每次都新建样式!
    >
      <Text>{item.title}</Text>
    </TouchableOpacity>
  )}
/>

// ✅ 正确优化后的版本
// 1. 提取Item为独立组件(利用PureComponent/memo避免不必要的re-render)
const ListItem = memo(function ListItem({ item, onPress }: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.itemContainer}  // StyleSheet提取在外部!
    >
      <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text numberOfLines={2} ellipsizeMode="tail">{item.desc}</Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // 自定义比较逻辑(可选,默认浅比较)
  return prevProps.item.id === nextProps.item.id;
});

// 2. keyExtractor必须提供且唯一
<FlatList
  data={longList}
  renderItem={({ item }) => <ListItem item={item} onPress={handlePress} />}
  keyExtractor={(item) => String(item.id)}  // 必须是string!
  
  // 性能相关属性
  removeClippedSubviews={true}  // 屏幕外视图卸载(Android有效,iOS默认true)
  maxToRenderPerBatch={10}  // 每批渲染数量(减少丢帧)
  windowSize={5}  // 视口外的渲染距离(越大越流畅但内存占用越高)
  initialNumToRender={10}  // 首次渲染数量
  updateCellsBatchingPeriod={50}  // 低优先级更新节流(ms)
  getItemLayout={(data, index) => (  // 如果列表项高度固定,提供此方法可大幅提升性能
    length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index
  )}

  // 下拉刷新/上拉加载
  onRefresh={handleRefresh}
  refreshing={isRefreshing}
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}  // 距底部多远时触发(0~1,0.5=50%处)

  ListEmptyComponent={<EmptyState />}
  ListFooterComponent={
    isLoadingMore ? <ActivityIndicator /> : null
  }
/>
```

### 2. 图片优化

```bash
# 必装的图片缓存库(大幅提升图片加载体验)
npm install react-native-fast-image
```

```tsx
import FastImage from 'react-native-fast-image';

// ❌ 默认Image组件(每次都下载,无缓存)
<Image source={{ uri: imageUrl }} style={{ width: 200, height: 200 }} />

// ✅ FastImage(多级缓存+预加载+渐入效果)
<FastImage
  style={{ width: 200, height: 200 }}
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,  // low/normal/high
    cacheKey: uniqueCacheKey,  // 自定义缓存key
    headers: { Authorization: token },  // 带认证头请求
  }}
  resizeMode={FastImage.resizeMode.cover}  // contain/cover/stretch/center
  
  // 占位图和加载状态
  onLoadStart={() => setLoading(true)}
  onLoadEnd={() => setLoading(false)}
  onError={(err) => setError(err)}
  
  fallback={<PlaceholderImage />}  // 加载失败时的fallback
/>

// 批量预加载(进入列表页前调用)
const imagesToPreload = items.map(item => ({ uri: item.imageUrl }));
FastImage.preload(imagesToPreload);
```

### 3. 动画优化

```tsx
// ❌ 不要在JS线程做复杂动画(会卡顿)
const [translateY, setTranslateY] = useState(0);

// 每次setState都会触发整个组件树re-render
Animated.timing(
  new Animated.Value(0),
  {
    toValue: 100,
    duration: 500,
    useNativeDriver: false,  // ❌ 不启用原生驱动,在JS线程跑
  }
).start();

// ✅ 始终使用原生驱动(useNativeDriver: true)!
// 原理:动画计算交给UI线程(非JS主线程),即使JS繁忙也不会掉帧

const translateY = useRef(new Animated.Value(0)).current;

// 方式一: Animated API
Animated.spring(translateY, {
  toValue: isOpen ? 0 : 300,  // 只能驱动这些原生支持的属性: transform/opacity
  useNativeDriver: true,  // ✅ 关键!必须在true
}).start();

// 方式二: Reanimated v2/v3 (更强大,支持声明式动画)
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  useAnimatedStyle,
  runOnUI,  // 在UI线程运行
} from 'react-native-reanimated';

function ReanimatedExample() {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: scale.value > 1 ? 0.8 : 1,
  }));

  const handlePress = () => {
    // 这些都在UI线程运行!
    'worklet';  // 声明这是worklet(可在UI线程执行的JS子集)
    translateX.value = withSpring(Math.random() * 300 - 150, { damping: 15 });
    scale.value = withTiming(1.2, { duration: 200 }, () => {
      scale.value = withTiming(1, { duration: 200 });  // 回调也在UI线程!
    });
  };

  return (
    <Animated.View style={[styles.box, animatedStyle]}>
      <TouchableOpacity onPress={handlePress}>
        <Text>Tap me!</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
```

### 4. 内存管理与大屏警告

```tsx
// 检测内存压力(iOS)
import { AppState, AppStateStatus } from 'react-native';
import { MemoryWarning } from 'react-native-memory-warning';

function MemoryAwareScreen() {
  useEffect(() => {
    const subscription = MemoryWarning.addListener(() => {
      console.warn('收到内存不足警告!');
      // 释放缓存/取消大的图片/清理不需要的状态
      clearLargeImagesCache();
      releaseUnusedResources();
    });

    return () => subscription.remove();
  }, []);

  // App切换到后台时也可以主动释放一些资源
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background') {
        pauseHeavyAnimations();
        stopLocationUpdates();
        cancelPendingRequests();
      } else if (state === 'active') {
        resumeNormalOperations();
      }
    });

    return sub.remove;
  }, []);

  // ...
}
```

---

## 🧪 测试策略

### 单元测试 (Jest)

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native react-test-renderer
```

```tsx
// __tests__/LoginForm.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginForm from '../src/screens/Login/LoginForm';

describe('<LoginForm />', () => {
  it('正确渲染表单字段', () => {
    const { getByPlaceholderText, getByText } = render(<LoginForm />);
    
    expect(getByPlaceholderText(/邮箱/i)).toBeTruthy();
    expect(getByPlaceholderText(/密码/i)).toBeTruthy();
    expect(getByText(/登录/i)).toBeTruthy();
  });

  it('输入框能正常输入', () => {
    const { getByPlaceholderText } = render(<LoginForm />);
    const emailInput = getByPlaceholderText(/邮箱/i);
    
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('表单验证:空提交显示错误', async () => {
    const { getByText, findByText, debug } = render(<LoginForm />);
    
    fireEvent.press(getByText('登录'));
    
    await expect(findByText(/邮箱不能为空/i)).resolves.toBeTruthy();
    await expect(findByText(/密码不能为空/i)).resolves.toBeTruthy();
  });

  it('成功提交后调用onSubmit', async () => {
    const mockSubmit = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <LoginForm onSubmit={mockSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText(/邮箱/i), 'valid@email.com');
    fireEvent.changeText(getByPlaceholderText(/密码/i), 'validPassword123');
    fireEvent.press(getByText(/登录/i));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'valid@email.com',
        password: 'validPassword123',
      });
    });
  });
});
```

### E2E测试 (Detox)

```bash
# 安装Detox
npm install detox-cli --global
detox build --configuration ios.sim.release
detox test --configuration ios.sim.release
```

```javascript
// e2e/Login.e2e.js
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true, permissions: { notifications: 'YES' } });
  });

  it('应该能够成功登录', async () => {
    await expect(element(by.id('email-input'))).toBeVisible();
    await element(by.id('email-input')).tap();
    await element(by.id('email-input')).replaceText('test@test.com');
    
    await expect(element(by.id('password-input'))).toBeVisible();
    await element(by.id('password-input')).tap();
    await element(by.id('password-input')).replaceText('123456');
    
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Welcome!'))).toBeVisible();
  });

  it('应该显示错误当凭证无效', async () => {
    await element(by.id('email-input')).replaceText('wrong@email.com');
    await element(by.id('password-input')).replaceText('wrongpass');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text(/密码或邮箱错误/i))).toBeVisible();
  });
});
```

---

## 📦 打包与发布

### Android (APK/AAB)

```bash
# 生成签名密钥(只需一次)
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.p12 -alias my-key-alias -keysize 2048 -keyalg RSA -validity 10000

# 配置android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=my-release-key.p12
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_password_here
MYAPP_UPLOAD_KEY_PASSWORD=your_password_here

# 生成Release AAB(提交Google Play)
cd android && ./gradlew assembleRelease
# 输出: android/app/build/outputs/bundle/release/app-release.aab

# 生成Debug APK(直接安装测试)
./gradlew assembleDebug
# 输出: android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS (IPA)

```bash
# 需要Mac + Xcode + Apple Developer账号($99/年)

# 1. 在Apple Developer后台创建App ID + Provisioning Profiles

# 2. Xcode中配置Signing & Capabilities

# 3. Archive (归档)
# Xcode → Product → Archive

# 4. 分发
# Window → Organizer → Select Archive → Distribute App → 选择方式(App Store Connect / Ad Hoc / Development / Enterprise)

# 或者命令行构建(需要fastlane)
# fastlane ios build
```

### CI/CD (GitHub Actions示例)

```yaml
# .github/workflows/build.yml
name: Build & Test

on:
  push:
    branches: [main]

jobs:
  build-android:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Build Android (Debug)
        working-directory: android
        run: ./gradlew assembleDebug
      
      - uses: actions/upload-artifact@v3
        with:
          name: app-debug.apk
          path: android/app/build/outputs/apk/debug/app-debug.apk

  build-ios:
    runs-on: macos-latest  # macOS runner才能构建iOS
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install CocoaPods
        run: |
          cd ios && pod install && cd ..
      
      - name: Build iOS (Simulator)
        run: |
          xcodebuild \
            -workspace ios/MyApp.xcworkspace \
            -scheme MyApp \
            -sdk iphonesimulator \
            -configuration Debug \
            -arch x86_64 \
            build CODE_SIGNING_ALLOWED=NO | xcpretty
```

---

## 📝 练习任务

### 任务1:构建完整的社交动态Feed流
实现包含以下功能的完整模块:
1. **下拉刷新 + 无限滚动** (FlatList优化版)
2. **图片浏览器** (双击点赞,缩放,滑动切换,FastImage缓存)
3. **评论/回复**嵌套结构
4. **@提及** 和 **话题(#)** 的富文本解析
5. **长按菜单**(复制/举报/收藏/分享)

### 任务2:实现即时通讯(IM)核心功能
基于WebSocket:
1. **聊天列表** (最新消息预览,未读数角标,在线状态指示)
2. **对话详情** (气泡样式区分自己/对方,时间分组,已读回执)
3. **多媒体消息** (图片/视频/语音/位置/文件)
4. **输入框智能扩展** (表情/@人/发送图片/语音录制)
5. **消息撤回/编辑**

### 任务3:上线一个真实的小型App(如记账本/习惯打卡)
完成全流程:
1. **需求分析与原型设计**
2. **技术选型与架构搭建**(状态管理/API层/路由)
3. **核心功能开发**(CRUD + 本地持久化AsyncStorage/Realm/WatermelonDB)
4. **UI打磨**(动效/适配深色模式/多语言)
5. **单元测试 + E2E测试**
6. **打包签名 + 提交App Store / Google Play**

---

## 🔗 相关资源

- [React Native官方文档](https://reactnative.dev/)
- [React Navigation文档](https://reactnavigation.org/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Fast Image](https://github.com/DylanVann/react-native-fast-image)
- [React Native Firebase](https://rnfirebase.io/)
- [Ignite (RN脚手架)](https://infinite.red/ignite/)
- [Awesome React Native (精选资源)](https://github.com/jondot/awesome-react-native)
- [Expo文档](https://docs.expo.dev/) (快速上手首选)

---

[← 28 - GraphQL与Apollo](../28-graphql/) | [→ 30 - 设计模式与架构](../30-design-patterns/)
