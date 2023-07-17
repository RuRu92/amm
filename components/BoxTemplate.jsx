import {Component} from "react";
import {RE} from "../utils/constants";
import {NumberUtils} from "../utils/NumberUtils";

export default class BoxTemplate extends Component {

    constructor(props) {
        super(props);
    }

    onInputChange = (e) => {
        if (e.target.value === "" || RE.test(e.target.value)) {
            this.props.onChange(e);
        }
    };

    render() {
        return (
            <div className="boxTemplate">
                <div className="boxBody">
                    <div>
                        <p className="leftHeader"> {this.props.leftHeader} </p>
                        <input
                            className="textField"
                            value={NumberUtils.fromNumber(this.props.value)}
                            onChange={(e) => this.onInputChange(e)}
                            placeholder={"Enter amount"}
                        />
                    </div>
                    <div className="rightContent">{this.props.right}</div>
                </div>
            </div>
        )
    };
}
