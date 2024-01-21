import van from 'vanjs-core';
import Counter from "./counter";

export default function StyledCounter(props = {}) {
	const { p, select, option } = van.tags
	const buttonStyle = van.state(van.val(props.buttonStyle) || "👆👇")
	const Option = (val) => option({selected: val === buttonStyle.val}, val);
	return p("Select the button style: ",
		select({ id: "button-style", oninput: e => buttonStyle.val = e.target.value },
			Option("👆👇"),
			Option("👍👎"),
			Option("🔼🔽"),
			Option("⏫⏬"),
			Option("📈📉"),
		),
		Counter({...props, buttonStyle})
	)
}
