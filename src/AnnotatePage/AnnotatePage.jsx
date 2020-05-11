import React, { Component } from 'react';
import './AnnotatePage.css';
import { AnnotateQuestion } from '../_components/AnnotateQuestion';
import { setProjectId } from "../_actions/projectIdActions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import axios from 'axios';
import jwt_decode from "jwt-decode";
import ScrollTo from "react-scroll-into-view";

/*
Answer model:
answer
questionID
imageID
userID
*/

class AnnotatePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            projectId: this.props.projectIdR.projectId,
            collapsedBar: "",
            projectTitle: 'Project Title',
            projectDescription: 'Project Description',
            questions: [],
            answers: [],
            tempQuestions: [
                {id: 1,
                text: "Is there a bird?", 
                description: "Do you see something with wings", 
                type:"Yes/No", 
                categories: "",
                required: "true" },
                {id: 2,
                text: "Type of bird?", 
                description: "Look at the wings, beak, etc.", 
                type:"Select Category", 
                categories: "Eagle,Crow,Hawk",
                required: "false" },
                {id: 3,
                text: "How many birds?", 
                description: "Count the birds", 
                type:"Numerical", 
                categories: "Eagle,Crow,Hawk",
                required: "false" },
                {id: 4,
                text: "How many birds?", 
                description: "Count the birds", 
                type:"Numerical", 
                categories: "Eagle,Crow,Hawk",
                required: "false" }
            ],
            image: {
                id: 1,
                src: ""
            },
            optionalNote: "",
            activeQuestion: 1,
            submitted: false,
            loading: false,
            error: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSkipQues = this.handleSkipQues.bind(this);
        this.handleAnswerNum = this.handleAnswerNum.bind(this);
        this.handleAnswerSelect = this.handleAnswerSelect.bind(this);
        this.displayQuestions = this.displayQuestions.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleKeyDown = (event) => {
        switch( event.keyCode ) {
            case 13:
                if (this.state.activeQuestion + 1 > this.state.questions.length) {
                    return;
                }

                const newActiveQ = this.state.activeQuestion + 1;
                const newActiveQIdx = newActiveQ - 1;

                this.setState({ activeQuestion: newActiveQ });
                var element = document.getElementById("answer"+newActiveQ);
                element.scrollIntoView({behavior: "smooth", block: "center"});
                
                if (this.state.questions[newActiveQIdx].type == "Numerical") {
                    document.getElementById("answer"+newActiveQ).focus();
                }
                break;
        }

    }

    componentDidMount() {
        this.handleWindowResize();
        window.addEventListener("resize", this.handleWindowResize.bind(this));

        // Gets the project and saves the title and description to state
        axios.get("http://localhost:5000/api/projects/"+this.state.projectId)
            .then(res => {
                console.log("Project data")
                console.log(res.data);
                this.setState({ projectTitle: res.data.title });
                this.setState({ projectDescription: res.data.description });
            })

        // Gets all of the questions for this project and create answer array
        axios.get("http://localhost:5000/api/questions/"+this.state.projectId)
            .then(res => {
                const questions = res.data.map((question, idx) => {
                    return {
                        id: idx+1,
                        text: question.content,
                        description: question.description,
                        type: question.type,
                        required: question.required.toString(),
                        categories: question.categories
                    }
                })
                this.setState({ questions: questions });
                

                const numQuestions = this.state.questions.length;
                let answerArr = Array(numQuestions).fill(undefined);
                this.setState({ answers: answerArr });
                
                console.log("questions");
                console.log(this.state.questions);
                console.log("answers");
                console.log(this.state.answers);

                var element = document.getElementById("answer1");
                element.scrollIntoView({behavior: "smooth", block: "center"}); 

                window.addEventListener("keydown", this.handleKeyDown);
            })            
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize.bind(this));
        window.removeEventListener("keydown", this.handleKeyDown);
    }
    

    handleWindowResize = () => {
        if (window.innerWidth < 973) {
            this.setState({ collapsedBar: " static-top" });
        }
        else {
            this.setState({ collapsedBar: " navbar-fixed-top" });
        }
    }

    handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    handleAnswerSelect(qId){
        const e = document.getElementById("answer"+qId);
        const newQType = e.options[e.selectedIndex].value;
        const newAnsArr = this.state.answers.map((item, idx) => {
            if (idx == qId - 1) {
                return newQType;
            }
            else {
                return item;
            }
        });
        
        this.setState({answers: newAnsArr});        
    }

    handleAnswerNum(qId){
        const e = document.getElementById("answer"+qId);
        const newQType = e.value;
        if (!isNaN(newQType) || 
            (newQType[0] == "-" && !isNaN(newQType.substring(1)) 
            || newQType=="-" || newQType=="." || newQType=="-.")) {
            const newAnsArr = this.state.answers.map((item, idx) => {
                if (idx == qId - 1) {
                    return newQType;
                }
                else {
                    return item;
                }
            });
            
            this.setState({answers: newAnsArr}); 
        }         
    }

    handleSkipQues(qId) {
        const newAnsArr = this.state.answers.map((item, idx) => {
            if (idx == qId - 1 && this.state.answers[idx] !== "Skip") {
                return "Skip";
            }
            else {
                return item;
            }
        });
        this.setState({answers: newAnsArr});   
    }

    displayQuestions() {
        const questions = this.state.questions;
        const listItems = questions.map((question, idx) =>
            <li className="question-cont">
                <AnnotateQuestion 
                    id = {question.id}
                    value = {this.state.answers[idx]}
                    text={question.text}
                    description={question.description}
                    type={question.type}
                    categories={question.categories}
                    required={question.required}
                    onSelect={this.handleAnswerSelect}
                    onChangeNum = {this.handleAnswerNum}
                    onSkip = {this.handleSkipQues}
                />
            </li>                
        );
        return (
            <ul className="question-list">{listItems}</ul>
        );
    }
    
    render() {
        const { projectTitle, image, loading, error } = this.state;

        let returnVal = 
            <div className="error-cont">
                <h3>Screen too small to display image.</h3>
            </div>
        
        if (window.innerWidth > 767) {
            returnVal = 
                <div className="annotate-cont">
                    <div className="col-sm-8 img-cont" >
                        <img src={"https://images.unsplash.com/photo-1507477338202-487281e6c27e?ixlib=rb-1.2.1&w=1000&q=80"} />
                    </div>
                    <div className="col-sm-4 form-cont" >
                        <form name="form-horizontal" className="form-annotate">
                            <h3 className="form-title">Annotating Image #{image.id} of</h3>
                            <h3 className="form-title"><em>{projectTitle}{this.state.activeQuestion}</em></h3>
                            
                            <div className="display-questions">
                                {this.displayQuestions()}
                                <div className="annotate-divider"></div>
                                <div className="optionalNote">
                                    <h4>Optional Note</h4>
                                    <label htmlFor="projectDescription">Enter any other important information.</label>
                                </div>
                                <textarea type="textarea" className="optional-note-text-area"  name="optionalNote" 
                                    value={this.state.optionalNote} onChange={this.handleChange} />
                            </div> 

                            <div className="form-group next-btn">
                                <button type="button" className="btn btn-primary" disabled={loading} >Next</button>
                                {loading &&
                                    <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                                }
                            </div>
                        </form>
                    </div>
                </div>
        }

        return (
            <div>
                {returnVal}
            </div>
        );
    }
}

AnnotatePage.propTypes = {
    setProjectId: PropTypes.func.isRequired,
    projectIdR: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    projectIdR: state.projectIdR
});

export default connect(
    mapStateToProps,
    { setProjectId }
)(AnnotatePage);