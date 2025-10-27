const NotificationProvider = require("./notification-provider");
const axios = require("axios");
const { DOWN, UP } = require("../../src/util");

class WeCom extends NotificationProvider {
    name = "WeCom";

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";

        try {
            let config = {
                headers: {
                    "Content-Type": "application/json"
                }
            };
            config = this.getAxiosConfigWithProxy(config);
            let body = this.composeMessage(heartbeatJSON, msg);
            await axios.post(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${notification.weComBotKey}`, body, config);
            return okMsg;
        } catch (error) {
            this.throwGeneralAxiosError(error);
        }
    }

    /**
     * Generate the message to send
     * @param {object} heartbeatJSON Heartbeat details (For Up/Down only)
     * @param {string} msg General message
     * @returns {object} Message
     */
    composeMessage(heartbeatJSON, msg) {
        let alertCard = "";
        if (msg !== null && heartbeatJSON !== null && heartbeatJSON.status === DOWN) {
            const serviceNameMatch = msg.match(/\[([^\]]+)\]/);
            const serviceName = serviceNameMatch ? serviceNameMatch[1] : "服务";
            const downTime = new Date().toLocaleString().replace(/\//g, "-");
            alertCard = `### 🚨 ${serviceName}访问异常通知\n**异常时间：** ${downTime}\n**异常信息：** ${msg}`;
        }

        if (!alertCard && msg !== null && heartbeatJSON !== null && heartbeatJSON.status === UP) {
            const serviceNameMatch = msg.match(/\[([^\]]+)\]/);
            const serviceName = serviceNameMatch ? serviceNameMatch[1] : "服务";
            const recoverTime = new Date().toLocaleString().replace(/\//g, "-");
            alertCard = `### 🟢 ${serviceName}访问恢复通知\n**恢复时间：** ${recoverTime}\n**信息：** ${msg}`;
        }
        if (!alertCard) {
            alertCard = "无告警信息";
        }
        return {
            msgtype: "markdown",
            markdown: {
                content: alertCard
            }
        };
    }
}

module.exports = WeCom;
