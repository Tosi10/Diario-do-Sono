import {
  createContext,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  type StyleProp,
  type View,
  type ViewStyle,
} from "react-native";

type RevealContext = {
  remember: (view: View | null) => void;
  reveal: (view: View | null) => void;
};

const FocusRevealContext = createContext<RevealContext | null>(null);

export function useScrollReveal(): RevealContext | null {
  return useContext(FocusRevealContext);
}

type Props = {
  children: ReactNode;
  className?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: "always" | "handled" | "never";
  /** Sobe o campo focado para ficar acima do teclado. */
  keepFocusedVisible?: boolean;
};

/** Só rolagem vertical — sem scroll lateral. */
export const AppScrollView = forwardRef<ScrollView, Props>(function AppScrollView(
  {
    children,
    className = "flex-1",
    contentContainerStyle,
    keyboardShouldPersistTaps = "handled",
    keepFocusedVisible = false,
  },
  ref
) {
  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const focusedRef = useRef<View | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const setScrollRef = useCallback(
    (node: ScrollView | null) => {
      scrollRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const reveal = useCallback((view: View | null) => {
    if (!view) return;
    view.measureInWindow((_x, y, _w, height) => {
      const windowH = Dimensions.get("window").height;
      const visibleBottom = windowH - keyboardHeightRef.current - 20;
      const fieldBottom = y + height;
      if (fieldBottom <= visibleBottom) return;
      const delta = fieldBottom - visibleBottom + 12;
      scrollRef.current?.scrollTo({
        y: offsetRef.current + delta,
        animated: true,
      });
    });
  }, []);

  const remember = useCallback((view: View | null) => {
    focusedRef.current = view;
  }, []);

  useEffect(() => {
    if (!keepFocusedVisible) return;
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, (e) => {
      keyboardHeightRef.current = e.endCoordinates.height;
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => reveal(focusedRef.current), Platform.OS === "ios" ? 60 : 40);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [keepFocusedVisible, reveal]);

  const scroll = (
    <ScrollView
      ref={setScrollRef}
      className={className}
      style={{ width: "100%" }}
      contentContainerStyle={[
        { width: "100%", flexGrow: 1 },
        contentContainerStyle,
        keepFocusedVisible && keyboardHeight > 0
          ? { paddingBottom: keyboardHeight + 24 }
          : null,
      ]}
      horizontal={false}
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      keyboardDismissMode="interactive"
      bounces
      overScrollMode="never"
      onScroll={(e) => {
        offsetRef.current = e.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
    >
      {children}
    </ScrollView>
  );

  if (!keepFocusedVisible) return scroll;

  return (
    <FocusRevealContext.Provider value={{ remember, reveal }}>
      {scroll}
    </FocusRevealContext.Provider>
  );
});
