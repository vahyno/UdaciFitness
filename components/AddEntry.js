import React, {Component} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {getMetricMetaInfo, timeToString, getDailyReminderValue} from '../utils/helpers';
import UdaciSlider from './UdaciSlider';
import UdaciSteppers from './UdaciSteppers';
import DateHeader from './DateHeader';
import {Ionicons} from '@expo/vector-icons';
import TextButton from './TextButton';
import {submitEntry, removeEntry} from '../utils/api';
import {connect} from 'react-redux';
import {addEntry} from '../actions';

function SubmitBtn ({onPress}) {
    return (
        <TouchableOpacity
            onPress={onPress}>
            <Text>SUBMIT</Text>
        </TouchableOpacity>
    )
}

class AddEntry extends Component {
    state = {
        run: 0,
        bike: 0,
        swim: 0,
        sleep: 0,
        eat: 0,
    }

    increment = (metric) => {
        const {max, step} = getMetricMetaInfo(metric);
        this.setState((state) => {
            const count = state[metric] + step;
            return {
                ...state,
                [metric]: count > max ? max : count,
            }
        })
    }

    decrement = (metric) => {
        const {step} = getMetricMetaInfo(metric);
        this.setState((state) => {
            const count = state[metric] - step;
            return {
                ...state,
                [metric]: count < 0 ? 0 : count,
            }
        })
    }

    slide = (metric, value) => {
        this.setState(()=>{
            return {
                [metric]: value,
            }
        })
    }

    submit = () => {
        const key = timeToString();
        const entry = this.state;
        // Update Redux:
        const {dispatch} = this.props;
        dispatch(addEntry({
            [key]:entry,
        }))

        this.setState(()=> ({
            run: 0,
            bike: 0,
            swim: 0,
            sleep: 0,
            eat: 0,
        }))
        // Navigation to Home
        // Save to 'DB'
        submitEntry({entry, key});
        // Clear local notification
    }

    reset = () => {
        const key = timeToString();
        const {dispatch} = this.props;
        // Update Redux:
        dispatch(addEntry({
            [key]: getDailyReminderValue(),
        }));
        // Navigation to Home
        // Update 'DB'
        removeEntry(key);
        // Clear local notification
        
    }

    render(){
        const metaInfo = getMetricMetaInfo();

        if (this.props.alreadyLogged) {
            return (
                <View>
                    <Ionicons
                        name='ios-happy-outline'
                        size={100}
                    />    
                    <Text>You already logged the information for today</Text>
                    <TextButton onPress={this.reset}>
                        Reset
                    </TextButton>
                </View>
            )
        }

        return (
            <View>
                <DateHeader date={(new Date()).toLocaleDateString()}/>
                {Object.keys(metaInfo).map((key)=>{
                   const {getIcon, type, ...rest} = metaInfo[key];
                   const value = this.state[key]

                   return (
                       <View key={key}>
                            {getIcon()}
                            {type === 'slider'
                            ? <UdaciSlider
                                value={value}
                                onChange={(value)=> this.slide(key, value)}
                                {...rest}/>
                            :  <UdaciSteppers
                                value={value}
                                onIncrement={()=> this.increment(key)}
                                onDecrement={()=> this.decrement(key)}
                                {...rest}/>
                            }
                       </View>
                   )
                })}
                <SubmitBtn onPress={this.submit}/> 
            </View>
        )
    }
}

function mapStateToProps (state) {
    const key = timeToString()
    return {
        alreadyLogged: state[key] && typeof state[key].today === 'undefined'
    }
}

export default connect(mapStateToProps)(AddEntry);