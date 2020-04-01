import React, { Component } from 'react';
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../_actions/authActions";

class LoginPage extends Component {
    constructor() {
        super();
        this.state = {
            email: "",
            password: "",
            errors: {}
        };
    };

    componentDidMount() {
        // If logged in and user navigates to Login page, should redirect them to dashboard
        if (this.props.auth.isAuthenticated) {
          this.props.history.push("/create-new-project");
        }
      }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
            this.props.history.push("/"); // push user to homepage when they login
        }
        if (nextProps.errors) {
            this.setState({
                errors: nextProps.errors
            });
        }
    }

    onChange = e => {
        this.setState({ [e.target.id]: e.target.value });
    };

    onSubmit = e => {
        e.preventDefault();

        const userData = {
            email: this.state.email,
            password: this.state.password
        };

        console.log(userData);
        this.props.loginUser(userData); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
    };

/*
Test account:
Email: grace.cheung@yale.edu
Password: test123
*/
render() {
    return (
        <div className="col-md-8 col-md-offset-2">
            <h2>Login</h2>
            <form name="form" onSubmit={this.onSubmit}>
                <div className={'form-group'}>
                    <label htmlFor="email">Email</label>
                    <input type="email" className="form-control" id="email" value={this.state.email} error={this.state.errors.email} onChange={this.onChange} />
                    <span>
                        {this.state.errors.email}
                        {this.state.errors.emailnotfound}
                    </span>
                </div>

                <div className={'form-group'}>
                    <label htmlFor="email">Password</label>
                    <input type="password" className="form-control" id="password" value={this.state.password} error={this.state.errors.password} onChange={this.onChange} />
                    <span>
                        {this.state.errors.password}
                        {this.state.errors.passwordincorrect}
                    </span>
                </div>

                <div className="form-group">
                    <button className="btn btn-primary" type="submit">Login</button>
                </div>

            </form>
        </div>
    );
};
};

LoginPage.propTypes = {
    loginUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { loginUser }
)(LoginPage);