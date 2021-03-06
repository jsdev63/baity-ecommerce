import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Grid, Row, Col } from "react-bootstrap";
import { base } from "config/base";
import FirestoreServices from 'services/FirestoreServices'
import FirestorePaginator from 'services/FirestorePaginator'
import IdeaBrief from "components/IdeaBrief";
import Loading from 'commons/Loading'
import styled from 'styled-components'
import InfiniteScroll from 'react-infinite-scroll-component';
import Idea from 'assets/img/AddingIdea.png';

const IconImg = styled.img`
width:20px;
 height:20px;
 margin-right:20px;
 @media only screen and (max-width: 767px) {
  width:15px;
  height:15px;
  margin-right:2px;
 }`
const Button = styled.button`
font-size:15px;
float:left;
width:180px;
height:40px;
@media only screen and (max-width: 767px) {
  font-size:12px;
  height: 35px;
  width:70%;}
  @media only screen and (max-width: 500px) {
    font-size:10px;
    height: 30px;
    width:90%;}
`;

const MoreButton = styled.button`
background-color:transparent;
border:1px solid rgb(26, 156, 142);
color:rgb(26, 156, 142);
  width:100px;
  height: 30px;
  @media only screen and (max-width: 767px) {
    height: 20px;
    width:40px;
    font-size:10px;
  `;

var paginator;
var hasMore = true;

class IdeaList extends Component {
  constructor() {
    super();
    this.state = {
      ideas: {},
      extraIdeas: [],
      loading: true,
      firstTime: true,
      page: 0,
      owner: ""
    };
  }

  componentWillMount() {
    this.listToArray = this.listToArray.bind(this)
    this.next = this.next.bind(this);
    hasMore = true;
    const { currentUser } = this.props;

    if (this.props.thisUserOnly) {
      var owner;
      if (this.props.user) {
        owner = currentUser
        this.setState({ owner: owner })
      } else {
        owner = currentUser.uid
        this.setState({ owner: owner })
      }
      if (this.props.shortList) {
        this.ideasRef = base.bindCollection(FirestoreServices.IDEAS_PATH, {
          context: this,
          state: "ideas",
          query: (ref) => {
            return ref.where('owner', '==', owner)
              .orderBy('timestamp', 'desc')
              .limit(3);
          },
          then(data) {
            this.setState({ loading: false })
          },
          onFailure(error) {
            this.setState({ errorHandling: { showError: true, errorMsg: error } });
          }
        });
      } else {
        var ref = FirestoreServices.ideas.where("owner", "==", owner).orderBy('timestamp', 'desc');
        paginator = new FirestorePaginator(ref, {})
        paginator.on()
          .then((docs) =>
            this.setState({
              ideas: docs,
              loading: false,
              firstTime: false
            })

          )

      }
    } else {
      var ref = FirestoreServices.ideas.orderBy('timestamp', 'desc')
      paginator = new FirestorePaginator(ref, {})
      paginator.on()
        .then((docs) =>
          this.setState({
            ideas: docs,
            loading: false,
            firstTime: false
          })
        )
      var ref = FirestoreServices.ideas.orderBy('timestamp', 'desc')
      this.firePaginator(ref);
    }
  }

  componentWillUnmount() {
    this.ideasRef && base.removeBinding(this.ideasRef);
  }

  firePaginator(ref) {
    paginator = new FirestorePaginator(ref, {})
    paginator.on()
      .then((docs) =>
        this.setState({
          ideas: docs,
          loading: false,
          firstTime: false
        })
      )
  }
  listToArray() {
    const ideas = this.state.ideas
    const ideaIds = Object.keys(ideas);

    var arr = [];
    ideaIds.reverse().map(id => {
      const idea = ideas[id];
      arr.push(idea)
    });
    var list = [...this.state.extraIdeas, ...arr.slice()]
    this.setState({ extraIdeas: list, loading: false })
  }

  next() {
    if (!paginator.hasMore) {
      hasMore = false;
    }
    console.log("next() Has more")
    paginator.next()
      .then((docs) => {
        if (!paginator.hasMore) {
          hasMore = false;
          console.log("next() Has no more")
          return
        }
        console.log("hasMore = " + paginator.hasMore)
        var newIdeas = this.state.ideas.concat(docs)
        this.setState({
          ideas: newIdeas,
          loading: false,
          firstTime: false
        })
      })
  }

  render() {
    const ideas = this.state.ideas;
    const ideaIds = Object.keys(ideas);

    var msg;
    var title;
    if (this.props.user) {
      msg = "لا يوجد أفكار"
      title = "الأفكار"
    } else {
      msg = " لم تقم باضافة أفكار، إبدأ الان"
      title = "أفكاري"
    }

    if (this.state.loading)
      return (
        <Loading />
      )
    else if (this.props.shortList) {
      return (

        <Grid style={{ backgroundColor: "white" }}>
          {this.props.group === 'prof'
            ? <Row style={{ display: 'flex', flexWrap: 'wrap' }}>
              <Col xs={12} lg={12} >

                <Col xs={5} md={3} lg={2} style={{ padding: "0 15px 0 0" }}>
                  <Link to={`/newidea`}>
                    <Button>إضافة فكرة<IconImg src={Idea} /></Button>
                  </Link>
                </Col>
                <Col xs={7} md={9} lg={10} >
                  <Link to={`/myideas`}>
                    <h3 style={{ color: 'rgb(26,156,142)', fontFamily: 'dinarm' }}>{title}</h3>
                  </Link>
                </Col>
              </Col>
            </Row>
            : <Row style={{ display: 'flex', flexWrap: 'wrap' }}>
              <Col xs={9} md={9} lg={10} >
                <Link to={`/${this.state.owner}/ideas`}>
                  <h3 style={{ color: 'rgb(26,156,142)', padding: "10px", fontFamily: 'dinarm' }}>{title} </h3>
                </Link >
              </Col>
              <Col xs={3} md={3} lg={2} style={{ padding: "20px 10px 0 0" }} >
                <Link to={`/${this.state.owner}/ideas`}>
                  <MoreButton>المزيد</MoreButton>
                </Link>
              </Col>
            </Row>
          }
          <Row style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Col xs={12} lg={12} style={{ padding: '0 5px 0 5px' }}>
              {ideaIds.length < 1
                ? <h4 style={{ textAlign: 'center' }}>{msg}</h4>
                : null}
              {ideaIds.map(id => {
                const idea = ideas[id];
                return <IdeaBrief key={id} idea={idea} />;
              })}
            </Col>
          </Row>
        </Grid>
      );
    } else {
      return (
        <div style={{ paddingTop: "30px" }}>
          <Grid>
            <Row style={{ display: 'flex', flexWrap: 'wrap' }}>

              <Col xs={12} md={12} style={{ padding: '0 5px 0 5px' }}>
                <InfiniteScroll style={{ overflow: 'none' }}
                  hasMore={hasMore}
                  next={this.next}
                >
                  {ideas.length < 1
                    ? <h5 style={{ textAlign: 'center' }}>{msg}</h5>
                    : null}
                  {ideas.map((idea, index) => {
                    return <IdeaBrief key={idea.id} idea={idea.data()} />;
                  })}
                </InfiniteScroll>

              </Col>
            </Row>
          </Grid>
        </div>
      );
    }
  }
}

export default IdeaList;
