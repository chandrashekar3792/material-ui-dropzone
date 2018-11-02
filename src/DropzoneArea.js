import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';  
import Dropzone from 'react-dropzone';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Grid from '@material-ui/core/Grid';
import {convertBytesToMbsOrKbs} from './helpers/helpers'
import SnackbarContentWrapper from './SnackbarContentWrapper';
import PreviewList from './PreviewList'

const styles = {
    dropZone: {
        position: 'relative',
        width: '100%',
        minHeight: 250,
        height: '100%',
        backgroundColor: '#F0F0F0',
        border: 'dashed',
        borderColor: '#C8C8C8',
        cursor: 'pointer',
        boxSizing: 'border-box',
        padding: '0 20px'
    },
    stripes: {
        width: '100%',
        minHeight: 250,
        height: '100%',
        cursor: 'pointer',
        border: 'solid',
        borderColor: '#C8C8C8',
        backgroundImage: 'repeating-linear-gradient(-45deg, #F0F0F0, #F0F0F0 25px, #C8C8C8 25px, #C8C8C8 50px)',
        animation: 'progress 2s linear infinite !important',
        backgroundSize: '150% 100%'
    },
    rejectStripes: {
        width: '100%',
        minHeight: 250,
        height: '100%',
        cursor: 'pointer',
        border: 'solid',
        borderColor: '#C8C8C8',
        backgroundImage: 'repeating-linear-gradient(-45deg, #fc8785, #fc8785 25px, #f4231f 25px, #f4231f 50px)',
        animation: 'progress 2s linear infinite !important',
        backgroundSize: '150% 100%',
    },
    dropzoneTextStyle:{
        textAlign: 'center'
    },
    uploadIconSize: {
        width: 51,
        height: 51,
        color: '#909090' 
    },
    dropzoneParagraph:{
        fontSize: 24
    }
}


class DropzoneArea extends Component{
    constructor(props){
        super(props);
        this.state = {
            fileObjects: [],
            openSnackBar: false,
            snackbarMessage: '',
            snackbarVariant: 'success'
        }
    }
    onDrop(files){
        const _this = this;
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                console.log(_this.state.fileObjects)
                console.log(_this.state.fileObjects.concat({file: file, data: event.target.result}))
                _this.setState({
                    fileObjects: _this.state.fileObjects.concat({file: file, data: event.target.result})
                },() => {
                    if(this.props.onChange){
                        this.props.onChange(_this.state.fileObjects.map(fileObject => fileObject.file));    
                    }
                    if(this.props.onDrop){
                        this.props.onDrop(file)
                    }
                    this.setState({
                        openSnackBar: true,
                        snackbarMessage: ('File ' + file.name+ ' successfully uploaded'), 
                        snackbarVariant: 'success'
                    });
                });
            };
            reader.readAsDataURL(file);
        })
    }
    handleRemove = fileIndex => event => {
        event.stopPropagation();
        const {fileObjects} = this.state;
        const file = fileObjects.filter((fileObject, i) => { return i === fileIndex})[0].file;
        fileObjects.splice(fileIndex, 1);
        this.setState(fileObjects,() => {
            if(this.props.onDelete){
                this.props.onDelete(file);    
            }
            if(this.props.onChange){
                this.props.onChange(this.state.fileObjects);    
            }
            this.setState({
                openSnackBar: true,
                snackbarMessage: ('File ' + file.name+ ' removed'),
                snackbarVariant: 'info'
            });
        });
    }
    handleDropRejected(rejectedFiles, evt) {
        var message = '';
        rejectedFiles.forEach((rejectedFile) => {
            var message = `File ${rejectedFile.name} was rejected. `;
            if(!this.state.acceptedFiles.includes(rejectedFile.type)){
                message += 'File type not supported. '
            }
            if(rejectedFile.size > this.state.fileSizeLimit){
                message += 'File is too big. Size limit is ' + convertBytesToMbsOrKbs(this.state.fileSizeLimit) + '. ';
            }
        });
        if(this.props.onDropRejected){
            this.props.onDropRejected(rejectedFiles, evt);
        }
        this.setState({
            openSnackBar: true,
            snackbarMessage: message,
            variant: 'error'
        });
    }
    onCloseSnackbar = () => {
        this.setState({
            openSnackBar: false,
        });
    };
    render(){
        const {classes} = this.props;
        const showPreviews = this.props.showPreviews && this.state.fileObjects.length > 0;
        const showPreviewsInDropzone = this.props.showPreviewsInDropzone && this.state.fileObjects.length > 0;
        return (
            <Fragment>
                <Dropzone
                    accept={this.props.acceptedFiles.join(',')}
                    onDrop={this.onDrop.bind(this)}
                    onDropRejected={this.handleDropRejected.bind(this)}
                    className={classes.dropZone}
                    acceptClassName={classes.stripes}
                    rejectClassName={classes.rejectStripes}
                    maxSize={this.props.maxFileSize}
                     >
                    <div className={classes.dropzoneTextStyle}>
                        <p className={classes.dropzoneParagraph}>
                            Drag and drop an image file here or click
                        </p>
                        <CloudUploadIcon className={classes.uploadIconSize}/>
                    </div>
                    {showPreviewsInDropzone &&
                        <PreviewList 
                            fileObjects={this.state.fileObjects} 
                            handleRemove={this.handleRemove.bind(this)}
                        />
                    }
                </Dropzone>
                {showPreviews &&
                    <Fragment>
                        <Grid container>
                            <span>Preview:</span>
                        </Grid>
                        <PreviewList 
                            fileObjects={this.state.fileObjects} 
                            handleRemove={this.handleRemove.bind(this)}
                        />
                    </Fragment>
                }
                {this.props.showAlerts &&
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={this.state.openSnackBar}
                        autoHideDuration={6000}
                        onClose={this.onCloseSnackbar}
                        >
                        <SnackbarContentWrapper
                            onClose={this.onCloseSnackbar}
                            variant={this.state.snackbarVariant}
                            message={this.state.snackbarMessage}
                        />
                    </Snackbar>              
                }
            </Fragment>
        )
    }
}

DropzoneArea.defaultProps = {
    acceptedFiles: ['image/jpeg', 'image/png', 'image/bmp', 'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    filesLimit: 3,
    maxFileSize: 3000000,
    showPreviews: false, // By default previews show up under in the dialog and inside in the standalone
    showPreviewsInDropzone: true
}
DropzoneArea.propTypes = {
    acceptedFiles: PropTypes.array,
    filesLimit: PropTypes.number,
    maxFileSize: PropTypes.number,
    showPreviews: PropTypes.bool,
    showPreviewsInDropzone: PropTypes.bool,
    showAlerts: PropTypes.bool,
    onChange: PropTypes.function,
    onDrop: PropTypes.function,
    onDropRejected: PropTypes.function,
    onDelete: PropTypes.function
}
export default withStyles(styles)(DropzoneArea)