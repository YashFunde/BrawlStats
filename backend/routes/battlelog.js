const express = require("express");
const axios = require("axios");

const router = express.Router();


// Get Player Battle Log
router.get("/:tag", async (req, res) => {

    try {

        const tag = req.params.tag;

        const response = await axios.get(
            `https://api.brawlstars.com/v1/players/${encodeURIComponent(tag)}/battlelog`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.BRAWL_STARS_API_KEY}`
                }
            }
        );

        res.json(response.data);

    } catch (error) {

        console.error(
            error.response?.data || error.message
        );

        res.status(
            error.response?.status || 500
        ).json({
            error: "Unable to fetch battle log"
        });

    }

});


module.exports = router;