import jsPDF from "jspdf";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, CircularProgress } from "@mui/material";

import styles from "./Predictor.module.css";

import { processImage } from "@/features/prediction/predictionActions";

import Navbar from "@/components/Elementals/Navbar/Navbar";

function Predictor() {
    const imageRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [originalImage, setOriginalImage] = useState(null);
    const [allowPrintPdf, setAllowPrintPdf] = useState(false);

    const dispatch = useDispatch();

    const predictedImage = useSelector(
        (state) => state.prediction.predictedImage
    );
    const retainedArea = useSelector((state) => state.prediction.retainedArea);
    const destroyedArea = useSelector(
        (state) => state.prediction.destroyedArea
    );

    const imageClickHandler = () => {
        imageRef.current.click();
    };

    const imageChangeHandler = (event) => {
        const file = event.target.files[0];
        setOriginalImage(file);
    };

    const imageSubmitHandler = async () => {
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", originalImage);

            await dispatch(processImage(formData));

            setAllowPrintPdf(true);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPdfHandler = async () => {
        const pdf = new jsPDF();
        const imgHeight = 110;
        const imgWidth = 150;

        const originalImageData = URL.createObjectURL(originalImage);

        const predictedImageBlob = await fetch(predictedImage).then((res) =>
            res.blob()
        );

        const predictedImageData = URL.createObjectURL(predictedImageBlob);

        pdf.setLineDash([]);
        pdf.line(10, 6, 200, 6);

        pdf.setFontSize(22);
        pdf.text("Prediction Report", 105, 15, {
            align: "center",
        });

        pdf.setLineDash([]);
        pdf.line(10, 19, 200, 19);

        pdf.setFontSize(18);
        pdf.text("Original Image", 105, 27, { align: "center" });
        pdf.addImage(
            originalImageData,
            "JPEG",
            105 - imgWidth / 2,
            32,
            imgWidth,
            imgHeight
        );

        pdf.setLineDash([]);
        pdf.line(10, 148, 200, 148);

        pdf.text("Predicted Image", 105, 157, { align: "center" });
        pdf.addImage(
            predictedImageData,
            "JPEG",
            105 - imgWidth / 2,
            162,
            imgWidth,
            imgHeight
        );

        pdf.setLineDash([]);
        pdf.line(10, 282, 200, 282);

        pdf.addPage();

        pdf.setLineDash([]);
        pdf.line(10, 7, 200, 7);

        pdf.setFontSize(16);

        pdf.setTextColor(0, 128, 0);
        pdf.text(`Retained Area: ${retainedArea.toFixed(2)} acres`, 105, 17, {
            align: "center",
        });

        pdf.setTextColor(255, 0, 0);
        pdf.text(`Destroyed Area: ${destroyedArea.toFixed(2)} acres`, 105, 29, {
            align: "center",
        });

        pdf.setLineDash([]);
        pdf.line(10, 35, 200, 35);

        pdf.setFontSize(20);
        pdf.setTextColor(0, 0, 0);
        pdf.text("© Guardinger Technologies", 105, 45, {
            align: "center",
        });

        pdf.setLineDash([]);
        pdf.line(10, 50, 200, 50);

        pdf.save("predictor_report.pdf");
    };

    return (
        <>
            <div className={styles.predictorContainer}>
                <Navbar />

                <div className={styles.uploadButtonCard}>
                    <Button
                        variant="contained"
                        size="large"
                        component="label"
                        className={styles.uploadButton}>
                        {"Image"}
                        <input
                            type="file"
                            ref={imageRef}
                            onChange={imageChangeHandler}
                            hidden
                        />
                    </Button>
                </div>

                <div className={styles.predictionCards}>
                    <div className={styles.imageCard}>
                        <input
                            type="file"
                            ref={imageRef}
                            style={{ display: "none" }}
                            onChange={imageChangeHandler}
                        />
                        <div
                            className={styles.imageTemplate}
                            onClick={imageClickHandler}>
                            {originalImage && (
                                <img
                                    src={URL.createObjectURL(originalImage)}
                                    alt="Input Image"
                                    className={styles.renderedImage}
                                />
                            )}
                        </div>
                    </div>
                    <div className={styles.imageCard}>
                        <div className={styles.imageTemplate}>
                            {predictedImage && (
                                <img
                                    src={predictedImage}
                                    alt="Predicted Image"
                                    className={styles.renderedImage}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.predictionButtonCard}>
                    {isLoading ? (
                        <CircularProgress
                            size={72}
                            color="inherit"
                            sx={{ margin: "1rem" }}
                        />
                    ) : (
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            className={styles.predictButton}
                            onClick={imageSubmitHandler}
                            disabled={isLoading}>
                            {"Predict"}
                        </Button>
                    )}
                </div>

                <div className={styles.reportTableCard}>
                    <h1 className={styles.reportTableHeading}>
                        <span>Report</span>
                    </h1>
                    <table className={styles.reportTable}>
                        <thead>
                            <tr>
                                <th className={styles.reportHeading}>
                                    Retained Area (Pink)
                                </th>
                                <th className={styles.reportHeading}>
                                    Destroyed Area (Red)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={styles.areas}>
                                    {retainedArea.toFixed(2)} {"acres"}
                                </td>
                                <td className={styles.areas}>
                                    {destroyedArea.toFixed(2)} {"acres"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        className={styles.reportDownloadButton}
                        disabled={!allowPrintPdf}
                        onClick={downloadPdfHandler}>
                        {"Print"}
                    </Button>
                </div>
            </div>
        </>
    );
}

export default Predictor;
