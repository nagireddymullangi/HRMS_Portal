// src/pages/admin/AIInsights.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiAlertTriangle, FiTrendingUp, FiAward, FiSmile,
  FiActivity, FiTarget, FiZap, FiBarChart2,
  FiUsers, FiDollarSign, FiChevronRight
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import aiService from '../../services/aiService';
import { formatCurrency, getInitials } from '../../utils/helpers';

const AIInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('OVERVIEW');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await aiService.getComprehensive();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loader /></Layout>;
  if (!data) return <Layout><p>No data</p></Layout>;

  const TABS = ['OVERVIEW', 'ATTRITION_RISKS', 'PERFORMANCE',
                 'RECOMMENDATIONS', 'BENCHMARKS'];

  const riskColors = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-500',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-500',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-500',
    LOW: 'bg-green-100 text-green-700 border-green-500',
  };

  const priorityColors = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-blue-100 text-blue-700',
  };

  return (
    <Layout>
      <PageHeader
        title="🤖 AI-Powered HR Insights"
        subtitle="Predictive analytics and smart recommendations"
      />

      {/* Sentiment Card */}
      <div className="card bg-gradient-to-r from-purple-600 via-pink-600
                      to-red-600 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiSmile className="h-6 w-6" />
              <p className="text-sm opacity-90">Overall Sentiment</p>
            </div>
            <p className="text-4xl font-bold">
              {data.sentimentAnalysis?.overallScore || 0}/100
            </p>
            <p className="text-sm mt-1">
              {data.sentimentAnalysis?.sentiment || 'ANALYZING'}
            </p>
          </div>
          <div className="text-right">
            {data.sentimentAnalysis?.insights?.slice(0, 2).map((i, idx) => (
              <p key={idx} className="text-sm opacity-90">{i}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap
              ${tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500'}`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Smart Recommendations */}
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiZap className="text-yellow-500" /> Smart Recommendations
            </h3>
            <div className="space-y-3">
              {data.smartRecommendations?.map((rec, idx) => (
                <div key={idx}
                     className="flex items-start justify-between p-4 bg-gray-50
                                rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-1
                                         rounded-full ${
                                           priorityColors[rec.priority]}`}>
                        {rec.priority}
                      </span>
                      <span className="badge-info text-xs">
                        {rec.category}
                      </span>
                    </div>
                    <h4 className="font-semibold">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <FiChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Alerts */}
          {data.attendanceAlerts?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiAlertTriangle className="text-orange-500" />
                Attendance Anomalies Detected
              </h3>
              <div className="space-y-2">
                {data.attendanceAlerts.slice(0, 5).map((a, idx) => (
                  <div key={idx}
                       className="flex items-center justify-between p-3
                                  bg-orange-50 border border-orange-200
                                  rounded-lg">
                    <div>
                      <p className="font-medium">{a.employeeName}</p>
                      <p className="text-xs text-orange-600">
                        {a.absentDays} absent • {a.lateDays} late arrivals
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full
                                       ${a.severity === 'HIGH'
                                         ? 'bg-red-100 text-red-700'
                                         : 'bg-yellow-100 text-yellow-700'}`}>
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATTRITION RISKS */}
      {tab === 'ATTRITION_RISKS' && (
        <div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
              <div key={level} className="card text-center">
                <p className="text-xs text-gray-500">{level}</p>
                <p className={`text-3xl font-bold mt-2 ${
                  level === 'CRITICAL' ? 'text-red-600' :
                  level === 'HIGH' ? 'text-orange-600' :
                  level === 'MEDIUM' ? 'text-yellow-600' :
                  'text-green-600'}`}>
                  {data.attritionRisks?.filter(r => r.riskLevel === level).length || 0}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {data.attritionRisks?.map(risk => (
              <div key={risk.employeeId}
                   className={`card border-l-4 ${
                     riskColors[risk.riskLevel]?.split(' ')[2]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br
                                    from-purple-500 to-pink-500 flex
                                    items-center justify-center text-white
                                    font-bold flex-shrink-0">
                      {getInitials(risk.employeeName)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800">
                          {risk.employeeName}
                        </h4>
                        <span className={`text-xs font-medium px-2 py-0.5
                                           rounded-full ${
                                             riskColors[risk.riskLevel]}`}>
                          {risk.riskLevel} RISK
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {risk.employeeCode} • {risk.designation} •
                        {risk.department}
                      </p>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Risk Factors:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-0.5">
                          {risk.factors?.map((f, i) => (
                            <li key={i}>• {f}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">
                          💡 Suggested Actions:
                        </p>
                        <ul className="text-sm text-blue-600 space-y-0.5">
                          {risk.suggestedActions?.slice(0, 2).map((a, i) => (
                            <li key={i}>→ {a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-3xl font-bold text-red-600">
                      {risk.riskScore}%
                    </p>
                    <p className="text-xs text-gray-500">Risk Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERFORMANCE */}
      {tab === 'PERFORMANCE' && (
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiAward className="text-yellow-500" /> Top Performers
          </h3>
          <div className="space-y-3">
            {data.topPerformers?.map((p, idx) => (
              <div key={p.employeeId}
                   className="flex items-center gap-4 p-3 bg-gradient-to-r
                              from-yellow-50 to-transparent rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center
                                  justify-center font-bold text-white
                                  ${idx === 0 ? 'bg-yellow-500' :
                                    idx === 1 ? 'bg-gray-400' :
                                    idx === 2 ? 'bg-orange-500' :
                                    'bg-blue-500'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{p.employeeName}</p>
                  <p className="text-xs text-gray-500">
                    {p.department} • {p.designation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {p.score}
                  </p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      {tab === 'RECOMMENDATIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.smartRecommendations?.map((rec, idx) => (
            <div key={idx} className="card">
              <div className="flex items-start justify-between mb-2">
                <span className="badge-info text-xs">{rec.category}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                                   ${priorityColors[rec.priority]}`}>
                  {rec.priority}
                </span>
              </div>
              <h4 className="font-bold text-gray-800">{rec.title}</h4>
              <p className="text-sm text-gray-600 mt-2">
                {rec.description}
              </p>
              <button className="btn-primary w-full mt-4 justify-center text-sm">
                Take Action <FiChevronRight />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* BENCHMARKS */}
      {tab === 'BENCHMARKS' && (
        <div className="space-y-6">
          {/* Salary Benchmarks */}
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiDollarSign /> Salary Benchmarks by Designation
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Designation', 'Count', 'Min', 'Average', 'Max'].map(h => (
                      <th key={h}
                          className="px-4 py-2 text-left text-xs font-semibold
                                     text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.salaryBenchmarks?.byDesignation?.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{b.designation}</td>
                      <td className="px-4 py-3">{b.count}</td>
                      <td className="px-4 py-3 text-red-600">
                        {formatCurrency(b.min)}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary-600">
                        {formatCurrency(b.avg)}
                      </td>
                      <td className="px-4 py-3 text-green-600">
                        {formatCurrency(b.max)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiTarget /> Skill Gap Analysis
            </h3>
            <div className="space-y-3">
              {data.skillGaps?.map((gap, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{gap.skill}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {gap.recommendation}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full
                                       ${priorityColors[gap.priority]}`}>
                      {gap.priority}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full"
                         style={{width: `${gap.gapPercentage}%`}} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {gap.gapPercentage}% skill gap
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AIInsights;