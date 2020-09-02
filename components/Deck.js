import React, { useRef, useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  UIManager,
  LayoutAnimation,
} from "react-native";
import { Card, Button } from "react-native-elements";
import Axios from "axios";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 500;

function RenderCard({ item }) {
  return (
    <Card title={item.title} image={{ uri: item.url }}>
      <Text style={{ marginBottom: 10 }}>I can customize the Card further</Text>
      <Button
        icon={{ name: "code" }}
        backgroundColor="#03A9F4"
        title="View Now!"
      />
    </Card>
  );
}

function RenderNoMoreCards({ setIndex }) {
  return (
    <Card title="All done!">
      <Text style={{ marginBottom: 10 }}>There's no more content here!</Text>
      <Button
        title="Get More!"
        background="#03A9F4"
        onPress={() => setIndex(0)}
      />
    </Card>
  );
}

function Deck({ onSwipeLeft = () => {}, onSwipeRight = () => {} }) {
  const position = useRef(new Animated.ValueXY()).current;
  const [index, setIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Axios.get("https://jsonplaceholder.typicode.com/photos?albumId=1")
      .then((res) => {
        setPhotos(res.data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const panResponser = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const SWIPE_RIGHT = gestureState.dx > SWIPE_THRESHOLD;
        const SWIPE_LEFT = gestureState.dx < -SWIPE_THRESHOLD;

        if (SWIPE_RIGHT) {
          return forceSwipe("right");
        }
        if (SWIPE_LEFT) {
          return forceSwipe("left");
        }
        return resetPosition();
      },
    })
  ).current;

  useEffect(() => {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  });

  useEffect(() => {
    setIndex(0);
  }, [photos]);

  const forceSwipe = useCallback(
    (direction) => {
      const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: false,
      }).start(() => onSwipeComplete(direction));
    },
    [position]
  );

  const onSwipeComplete = (direction) => {
    const item = photos[index];
    direction === "right" ? onSwipeRight(item) : onSwipeLeft(item);
    position.setValue({ x: 0, y: 0 });
    setIndex((prevIndex) => prevIndex + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"],
      extrapolate: "clamp",
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  if (index >= photos.length) return <RenderNoMoreCards setIndex={setIndex} />;

  return (
    <View>
      {photos
        .map((item, i) => {
          if (i < index) return null;

          if (i === index) {
            return (
              <Animated.View
                {...panResponser.panHandlers}
                style={[getCardStyle(), styles.cardStyle]}
                key={item.id}
              >
                <RenderCard item={item} />
              </Animated.View>
            );
          }

          return (
            <Animated.View
              key={item.id}
              style={[styles.cardStyle, { top: 10 * (i - index) }]}
            >
              <RenderCard item={item} />
            </Animated.View>
          );
        })
        .reverse()}
    </View>
  );
}

const styles = StyleSheet.create({
  cardStyle: {
    position: "absolute",
    width: SCREEN_WIDTH,
  },
});

export default Deck;
