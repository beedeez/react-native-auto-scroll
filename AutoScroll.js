// https://github.com/fritx/react-native-auto-scroll
// UX Interactions kept consistent with Wechat App

import React, { Component } from 'react';
import { Keyboard, Platform, ScrollView } from 'react-native';

export default class AutoScroll extends Component {
	constructor(props, context) {
		super(props, context);

		this.contentHeight = null;
		this.scrollHeight = null;
		this.scrollY = null;

		// self binding
		[
			'handleKeyboardShow',
			'handleKeyboardHide',
			'handleLayout',
			'handleContentChange',
			'handleScroll'
		].forEach(method => {
			this[method] = this[method].bind(this);
		});
	}

	componentDidMount() {
		this.keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			this.handleKeyboardShow
		);
		this.keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			this.handleKeyboardHide
		);
		this.handleInitialScroll();
	}
	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	safeRefScrollTo(scrollParams) {
		if (this.refs.scroller) {
			this.refs.scroller.scrollTo(scrollParams);
		}
	}
	// todo: handle layout instead of keyboard
	handleKeyboardShow() {
		this.scrollToBottom();
	}
	handleKeyboardHide() {
		const { scrollY, scrollHeight, contentHeight } = this;

		// fix iOS bouncing scroll effect
		if (Platform.OS === 'ios') {
			// fix top blank if exsits
			// detection also has trouble on Android
			if (scrollY > contentHeight - scrollHeight) {
				this.safeRefScrollTo({ y: 0 });
			}
			// fix bottom blank if exsits
			// else {
			//   this.scrollToBottom()
			// }
			else {
				this.safeRefScrollTo({ y: scrollY });
			}
		}
	}

	handleScroll(e) {
		this.scrollY = e.nativeEvent.contentOffset.y;
	}
	handleLayout(e) {
		this.scrollHeight = e.nativeEvent.layout.height;
	}

	handleContentChange(w, h) {
		// repeated called on Android
		// should do diff
		if (h === this.contentHeight) return;
		this.contentHeight = h;
		if (this.scrollHeight == null) {
			setTimeout(() => {
				this.scrollToBottomIfNecessary();
			}, 500);
		} else {
			this.scrollToBottomIfNecessary();
		}
	}

	scrollToBottomIfNecessary() {
		// todo: range detection
		this.scrollToBottom();
	}
	scrollToBottom() {
		const { scrollHeight, contentHeight } = this;
		if (scrollHeight == null) {
			return;
		}
		if (contentHeight > scrollHeight) {
			this.safeRefScrollTo({ y: contentHeight - scrollHeight });
		}
	}

	handleInitialScroll = () => {
		if (this.scrollHeight == null || this.contentHeight == null) {
			setTimeout(() => {
				this.scrollToBottomIfNecessary();
			}, 800);
		} else {
			this.scrollToBottomIfNecessary();
		}
	};

	render() {
		return (
			<ScrollView
				ref="scroller"
				scrollEventThrottle={16}
				onScroll={this.handleScroll}
				onLayout={this.handleLayout}
				onContentSizeChange={this.handleContentChange}
				{...this.props}
			/>
		);
	}
}
